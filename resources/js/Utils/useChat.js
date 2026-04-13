import axios from "axios";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePage, router } from "@inertiajs/react";
import { v4 as uuidv4 } from "uuid";
import { buildSidebarMaps, debounce } from "@/Utils/chatUtils";

function makeBatcher(url, field, delayMs = 80) {
  let pending = new Set();
  let timer   = null;

  const flush = () => {
    if (!pending.size) return;
    const ids = [...pending];
    pending   = new Set();
    timer     = null;
    axios.post(url, { [field]: ids }).catch(() => {});
  };

  return (id) => {
    pending.add(id);
    if (!timer) timer = setTimeout(flush, delayMs);
  };
}

function makeSeenBatcher(delayMs = 120) {
  const timers = {};
  return (convId) => {
    clearTimeout(timers[convId]);
    timers[convId] = setTimeout(() => {
      axios.post("/messages/seen", { conversation_id: convId }).catch(() => {});
      delete timers[convId];
    }, delayMs);
  };
}

export default function useChat(routePath = "/chat") {
  const {
    conversations = [],
    otherUsers    = [],
    authUser,
    chatHistory   = [],
  } = usePage().props;

  const authUserRef       = useRef(authUser);
  const selectedUserRef   = useRef(null);
  const channelRegistry   = useRef(new Map());
  const typingTimeouts    = useRef({});        
  const ignoreTypingUntil = useRef({});           
  const mountedRef        = useRef(true);

  const sendTyping = useRef(
    debounce((convId) => axios.post("/typing", { conversation_id: convId }), 300)
  ).current;

  const deliveredBatcher = useRef(makeBatcher("/messages/delivered", "message_ids", 80));
  const seenBatcher      = useRef(makeSeenBatcher(120));
  const onMessageRef  = useRef(null);
  const onPatchRef    = useRef(null);
  const onPatchAllRef = useRef(null);
  const [sidebarMaps,  setSidebarMaps]  = useState(() => buildSidebarMaps(conversations));
  const [typing,       setTyping]       = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading,    setIsLoading]    = useState(false);

  const [msgStore, setMsgStore] = useState({});

  const [historyKey, setHistoryKey] = useState(0);

  const [unreadMap, setUnreadMap] = useState(() => {
    const m = {};
    conversations.forEach((c) => { m[c.id] = c.unread_count ?? 0; });
    return m;
  });

  useEffect(() => { authUserRef.current = authUser; }, [authUser]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      Object.values(typingTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  const updateSidebarRecord = useCallback((convId, message, createdAt, senderId) => {
    setSidebarMaps((prev) => {
      const messages   = new Map(prev.messages);
      const timestamps = new Map(prev.timestamps);
      const senders    = new Map(prev.senders);
      messages.set(convId, message);
      timestamps.set(convId, new Date(createdAt).getTime());
      senders.set(convId, senderId);
      return { ...prev, messages, timestamps, senders };
    });
  }, []);

  const upsertMessage = useCallback((convId, msgId, data, deleteKey = null) => {
    if (!mountedRef.current) return;
    setMsgStore((prev) => {
      const bucket = { ...(prev[convId] ?? {}) };
      if (bucket[msgId]) return prev;              
      if (deleteKey && bucket[deleteKey]) delete bucket[deleteKey];
      bucket[msgId] = data;
      return { ...prev, [convId]: bucket };
    });
  }, []);

  const patchMessage = useCallback((convId, msgId, patch) => {
    if (!mountedRef.current) return;
    setMsgStore((prev) => {
      const bucket = prev[convId];
      if (!bucket?.[msgId]) return prev;
      return { ...prev, [convId]: { ...bucket, [msgId]: { ...bucket[msgId], ...patch } } };
    });
  }, []);

  const patchAllInConv = useCallback((convId, predicate, patch) => {
    if (!mountedRef.current) return;
    setMsgStore((prev) => {
      const bucket = prev[convId];
      if (!bucket) return prev;
      const next  = { ...bucket };
      let changed = false;
      Object.keys(next).forEach((k) => {
        if (predicate(next[k])) { next[k] = { ...next[k], ...patch }; changed = true; }
      });
      return changed ? { ...prev, [convId]: next } : prev;
    });
  }, []);

  const handleIncomingMessage = useCallback((e) => {
    const { message } = e;
    const convId   = message.conversation_id;
    const msgId    = message.id;
    const senderId = message.sender_id;
    const clientId = e.client_id ?? null;
    const myId     = authUserRef.current.id;
    const isFromMe = Number(senderId) === Number(myId);

    const isCurrentConv =
      selectedUserRef.current?.conversation_id === convId ||
      (
        !isFromMe &&
        Number(selectedUserRef.current?.id) === Number(senderId) &&
        !selectedUserRef.current?.conversation_id
      );

    ignoreTypingUntil.current[senderId] = Date.now() + 2000;
    setTyping((prev) => {
      if (!prev[senderId]) return prev;
      const next = { ...prev };
      delete next[senderId];
      return next;
    });

    updateSidebarRecord(convId, message.message, message.created_at, senderId);

    if (
      !isFromMe &&
      Number(selectedUserRef.current?.id) === Number(senderId) &&
      !selectedUserRef.current?.conversation_id
    ) {
      selectedUserRef.current = { ...selectedUserRef.current, conversation_id: convId };
      setSelectedUser((u) => u ? { ...u, conversation_id: convId } : u);
    }

    if (!isFromMe && !isCurrentConv) {
      setUnreadMap((prev) => ({ ...prev, [convId]: (prev[convId] ?? 0) + 1 }));
    }

    if (!isFromMe && isCurrentConv) {
      seenBatcher.current(convId);
    }

    if (isCurrentConv) {
      upsertMessage(convId, msgId, { ...message, status: "sent" }, clientId);
    }

    if (!isFromMe) {
      deliveredBatcher.current(msgId);
    }
  }, [updateSidebarRecord, upsertMessage]);

  onMessageRef.current  = handleIncomingMessage;
  onPatchRef.current    = patchMessage;
  onPatchAllRef.current = patchAllInConv;

  const subscribe = useCallback((convId) => {
    if (channelRegistry.current.has(convId)) return;

    const channel = window.Echo.private(`conversation.${convId}`)
      .listen(".message.sent",     (e) => onMessageRef.current?.(e))
      .listen(".message.delivered", (e) => {
        onPatchRef.current?.(e.conversationId, e.messageId, { status: "delivered" });
      })
      .listen(".message.seen", (e) => {
        if (Number(e.user_id) !== Number(authUserRef.current.id)) {
          onPatchAllRef.current?.(
            e.conversation_id,
            (msg) => Number(msg.sender_id) === Number(authUserRef.current.id),
            { status: "seen" }
          );
        }
      })
      .listen(".typing", (e) => {
        const sid = Number(e.userId);
        const now = Date.now();

        if (ignoreTypingUntil.current[sid] && now < ignoreTypingUntil.current[sid]) return;
        if (sid === Number(authUserRef.current.id)) return;

        clearTimeout(typingTimeouts.current[sid]);

        setTyping((prev) => (prev[sid] ? prev : { ...prev, [sid]: true }));

        typingTimeouts.current[sid] = setTimeout(() => {
          if (!mountedRef.current) return;
          setTyping((prev) => {
            if (!prev[sid]) return prev;
            const next = { ...prev };
            delete next[sid];
            return next;
          });
          delete typingTimeouts.current[sid];
        }, 3000);
      });

    channelRegistry.current.set(convId, channel);
  }, []);

  useEffect(() => {
    if (!authUser?.id) return;

    window.Echo.private(`user.${authUser.id}`)
      .listen(".message.sent", (e) => {
        const convId = e.message.conversation_id;
        const isNewConv = !channelRegistry.current.has(convId);

        if (isNewConv) {
          subscribe(convId);
          router.reload({ only: ["conversations", "otherUsers"] });
          onMessageRef.current?.(e);
        }
      });

    return () => window.Echo.leave(`user.${authUser.id}`);
  }, [authUser?.id, subscribe]);

  useEffect(() => {
    conversations.forEach((conv) => subscribe(conv.id));

    const currentIds = new Set(conversations.map((c) => c.id));
    channelRegistry.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        window.Echo.leave(`conversation.${id}`);
        channelRegistry.current.delete(id);
      }
    });
  }, [conversations, subscribe]);

  useEffect(() => {
    if (!chatHistory.length || !selectedUserRef.current?.conversation_id) return;
    const convId = selectedUserRef.current.conversation_id;

    setMsgStore((prev) => {
      const next = {};
      chatHistory.forEach((msg) => {
        next[msg.id] = { ...msg, status: msg.status ?? "sent" };
      });

      const existing = prev[convId] ?? {};
      Object.keys(existing).forEach((k) => {
        if (existing[k].status === "sending" && !next[k]) next[k] = existing[k];
      });
      return { ...prev, [convId]: next };
    });

    setHistoryKey((n) => n + 1);
  }, [chatHistory]);

  const sortedUsers = useMemo(() => {
    const { messages, timestamps, senders } = sidebarMaps;

    const withConv = conversations.map((conv) => {
      const user = conv.users.find((u) => u.id !== authUser.id);
      const cid  = conv.id;
      return {
        ...user,
        conversation_id:     cid,
        lastMessage:         messages.get(cid) ?? conv.latest_message?.message ?? null,
        lastMessageSenderId: senders.get(cid)  ?? conv.latest_message?.sender_id ?? null,
        timestamp:           timestamps.get(cid) ??
                             (conv.latest_message
                               ? new Date(conv.latest_message.created_at).getTime()
                               : 0),
      };
    });

    const withoutConv = otherUsers
      .filter((u) => !conversations.some((c) => c.users.some((cu) => cu.id === u.id)))
      .map((u) => ({ ...u, timestamp: 0, conversation_id: null, lastMessageSenderId: null }));

    return [...withConv, ...withoutConv].sort((a, b) => b.timestamp - a.timestamp);
  }, [conversations, otherUsers, sidebarMaps, authUser.id]);

  const users = useMemo(() => {
    return sortedUsers.map((u) => ({
      ...u,
      unreadCount:
        selectedUser?.conversation_id === u.conversation_id
          ? 0
          : (unreadMap[u.conversation_id] ?? 0),
    }));
  }, [sortedUsers, unreadMap, selectedUser?.conversation_id]);

  const filteredMessages = useMemo(() => {
    if (!selectedUser) return [];
    const key    = selectedUser.conversation_id ?? `pending_${selectedUser.id}`;
    const bucket = msgStore[key];
    if (!bucket) return [];
    return Object.values(bucket).sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }, [msgStore, selectedUser]);

  const handleSelectUser = useCallback((user) => {
    if (!user) {
      setSelectedUser(null);
      selectedUserRef.current = null;
      router.get(routePath, {}, { preserveState: true, replace: true });
      return;
    }
    if (selectedUserRef.current?.id === user.id) return;

    setSelectedUser(user);
    selectedUserRef.current = user;
    setIsLoading(true);

    if (user.conversation_id) {
      setUnreadMap((prev) =>
        prev[user.conversation_id] === 0
          ? prev
          : { ...prev, [user.conversation_id]: 0 }
      );
      seenBatcher.current(user.conversation_id);
    }

    router.get(routePath, { selected: user.id }, {
      preserveState: true,
      replace: true,
      only: ["chatHistory", "conversations", "otherUsers"],
      onFinish: () => setIsLoading(false),
    });
  }, [routePath]);

  const handleSend = useCallback((text) => {
    if (!selectedUserRef.current || !text.trim()) return;

    const user     = selectedUserRef.current;
    const clientId = uuidv4();
    const convId   = user.conversation_id;
    const now      = new Date().toISOString();
    const key      = convId ?? `pending_${user.id}`;

    const optimistic = {
      id:         clientId,
      message:    text,
      sender_id:  authUserRef.current.id,
      status:     "sending",
      created_at: now,
    };

    setMsgStore((prev) => {
      const bucket = { ...(prev[key] ?? {}) };
      bucket[clientId] = optimistic;
      return { ...prev, [key]: bucket };
    });

    if (convId) {
      setUnreadMap((prev) =>
        prev[convId] === 0 ? prev : { ...prev, [convId]: 0 }
      );
      updateSidebarRecord(convId, text, now, authUserRef.current.id);
    }

    router.post("/messages", { message: text, receiver_id: user.id, client_id: clientId }, {
      preserveScroll: true,
      only: ["conversations"],
      onSuccess: (page) => {
        if (!convId) {
          const newConv = (page.props.conversations ?? []).find((c) =>
            c.users.some((u) => u.id === user.id)
          );
          if (newConv) {
            const pendingKey = `pending_${user.id}`;
            setMsgStore((prev) => {
              const next = { ...prev };
              if (next[pendingKey]) {
                next[newConv.id] = next[pendingKey];
                delete next[pendingKey];
              }
              return next;
            });
            selectedUserRef.current = { ...user, conversation_id: newConv.id };
            setSelectedUser((u) => u ? { ...u, conversation_id: newConv.id } : u);
            subscribe(newConv.id);
            updateSidebarRecord(newConv.id, text, now, authUserRef.current.id);
          }
        }
      },
    });
  }, [subscribe, updateSidebarRecord]);

  return {
    users,
    authUser,
    selectedUser,
    filteredMessages,
    handleSelectUser,
    handleSend,
    isLoading,
    typing,
    sendTyping, 
    historyKey,
  };
}