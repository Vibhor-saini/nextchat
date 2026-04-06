import axios from "axios";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePage, router } from "@inertiajs/react";
import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build sidebar maps from a conversations array — pure, no side-effects */
function buildSidebarMaps(conversations) {
  const messages = new Map();
  const timestamps = new Map();
  const senders = new Map();
  const unreads = new Map();

  conversations.forEach((conv) => {
    const lm = conv.latest_message;
    if (lm) {
      messages.set(conv.id, lm.message);
      timestamps.set(conv.id, new Date(lm.created_at).getTime());
      senders.set(conv.id, lm.sender_id);
    }
    unreads.set(conv.id, conv.unread_count ?? 0);
  });

  return { messages, timestamps, senders, unreads };
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useChat(routePath = "/chat") {
  const {
    conversations = [],
    otherUsers = [],
    authUser,
    chatHistory = [],
  } = usePage().props;

  // ── Sidebar state ─────────────────────────────────────────────────────────
  // Single object instead of 4 separate states → one re-render per update
  const [sidebarMaps, setSidebarMaps] = useState(() =>
    buildSidebarMaps(conversations)
  );

  const [typing, setTyping] = useState(false);

  // ── Message state ─────────────────────────────────────────────────────────
  // Keyed by conversation_id → Map<msgId, msg> so filtering is O(1)
  const [convMessages, setConvMessages] = useState(new Map());

  // ── Selected user ─────────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Stable ref — avoids stale closures in Echo callbacks without re-subscribing
  const selectedUserRef = useRef(null);
  const authUserRef = useRef(authUser);
  useEffect(() => { authUserRef.current = authUser; }, [authUser]);

  // ── Echo channel registry ─────────────────────────────────────────────────
  // convId → Echo channel instance; never re-created for the same convId
  const channelRegistry = useRef(new Map());

  // ── Unread counts ─────────────────────────────────────────────────────────
  const [unreadMap, setUnreadMap] = useState(() => {
    const map = new Map();
    conversations.forEach((c) => map.set(c.id, c.unread_count ?? 0));
    return map;
  });

  // ---------------------------------------------------------------------------
  // Echo message handler — stable reference via useCallback + refs
  // ---------------------------------------------------------------------------
  const handleIncomingMessage = useCallback((e) => {
    const convId  = e.message.conversation_id;
    const msgId   = e.message.id;
    const clientId = e.client_id ?? null;
    const isFromMe = Number(e.message.sender_id) === Number(authUserRef.current.id);
    const isCurrentConv =
      selectedUserRef.current?.conversation_id &&
      Number(selectedUserRef.current.conversation_id) === Number(convId);

    // 1. Sidebar maps — single setState call
    setSidebarMaps((prev) => {
      // Avoid object churn if nothing actually changed
      const prevMsg = prev.messages.get(convId);
      if (prevMsg === e.message.message) return prev;

      const messages   = new Map(prev.messages);
      const timestamps = new Map(prev.timestamps);
      const senders    = new Map(prev.senders);

      messages.set(convId, e.message.message);
      timestamps.set(convId, new Date(e.message.created_at).getTime());
      senders.set(convId, e.message.sender_id);

      return { ...prev, messages, timestamps, senders };
    });

    // 2. Unread — only increment for messages from others, and only if conv not open
    if (!isFromMe && !isCurrentConv) {
      setUnreadMap((prev) => {
        const map = new Map(prev);
        map.set(convId, (map.get(convId) ?? 0) + 1);
        return map;
      });
    }

    // 3. Message store — only touch if this conv is open
    if (isCurrentConv) {
      setConvMessages((prev) => {
        const convMap = new Map(prev.get(convId) ?? []);

        // Deduplicate: ignore if already stored
        if (convMap.has(msgId)) return prev;

        // Replace optimistic bubble if client_id matches
        if (clientId && convMap.has(clientId)) {
          convMap.delete(clientId);
        }

        convMap.set(msgId, { ...e.message, status: "sent" });

        const next = new Map(prev);
        next.set(convId, convMap);
        return next;
      });
    }

    // mark delivered
  if (!isFromMe) {
    axios.post("/messages/delivered", {
      message_ids: [msgId],
    });
  }
  }, []); // no deps — uses refs only 

  // ---------------------------------------------------------------------------
  // Subscribe to a conversation channel — idempotent
  // ---------------------------------------------------------------------------
  const subscribe = useCallback((convId) => {
    if (channelRegistry.current.has(convId)) return;

    const channel = window.Echo
  .private(`conversation.${convId}`)

  // existing
  .listen(".message.sent", handleIncomingMessage)

  // delivered
  .listen(".message.delivered", (e) => {
    setConvMessages((prev) => {
      const convMap = new Map(prev.get(e.conversationId) ?? []);

      if (convMap.has(e.messageId)) {
        convMap.set(e.messageId, {
          ...convMap.get(e.messageId),
          status: "delivered",
        });
      }

      return new Map(prev).set(e.conversationId, convMap);
    });
  })

  // seen
  .listen(".message.seen", (e) => {
    setConvMessages((prev) => {
      const convMap = new Map(prev.get(e.conversationId) ?? []);

      convMap.forEach((msg, key) => {
        if (msg.sender_id === authUserRef.current.id) {
          convMap.set(key, { ...msg, status: "seen" });
        }
      });

      return new Map(prev).set(e.conversationId, convMap);
    });
  })

  // typing
  .listen(".typing", (e) => {
    if (e.userId !== authUserRef.current.id) {
      setTyping(true);
      setTimeout(() => setTyping(false), 1500);
    }
  });

    channelRegistry.current.set(convId, channel);
  }, [handleIncomingMessage]);

  // ---------------------------------------------------------------------------
  // Subscribe to all known conversations on mount / when list grows
  // ---------------------------------------------------------------------------
  useEffect(() => {
    conversations.forEach((conv) => subscribe(conv.id));

    // Sync sidebar maps from fresh server data (fills gaps after page nav)
    setSidebarMaps((prev) => {
      let changed = false;
      const messages   = new Map(prev.messages);
      const timestamps = new Map(prev.timestamps);
      const senders    = new Map(prev.senders);

      conversations.forEach((conv) => {
        if (!messages.has(conv.id) && conv.latest_message) {
          messages.set(conv.id, conv.latest_message.message);
          timestamps.set(conv.id, new Date(conv.latest_message.created_at).getTime());
          senders.set(conv.id, conv.latest_message.sender_id);
          changed = true;
        }
      });

      return changed ? { ...prev, messages, timestamps, senders } : prev;
    });

    // Prune channels for conversations no longer in the list
    const currentIds = new Set(conversations.map((c) => c.id));
    channelRegistry.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        window.Echo.leave(`private-conversation.${id}`);
        channelRegistry.current.delete(id);
      }
    });
  }, [conversations, subscribe]);

  // ---------------------------------------------------------------------------
  // Load chatHistory into convMessages — merge, never wipe
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!chatHistory.length || !selectedUserRef.current?.conversation_id) return;

    const convId = selectedUserRef.current.conversation_id;

    setConvMessages((prev) => {
      const existing = prev.get(convId) ?? new Map();
      let changed = false;
      const convMap = new Map(existing);

      chatHistory.forEach((msg) => {
        if (!convMap.has(msg.id)) {
          convMap.set(msg.id, { ...msg, status: "sent" });
          changed = true;
        }
      });

      if (!changed) return prev;

      const next = new Map(prev);
      next.set(convId, convMap);
      return next;
    });
  }, [chatHistory]);

  // ---------------------------------------------------------------------------
  // Derived: users list for sidebar
  // ---------------------------------------------------------------------------
  const users = useMemo(() => {
    const { messages, timestamps, senders } = sidebarMaps;

    const withConv = conversations.map((conv) => {
      const user = conv.users.find((u) => u.id !== authUser.id);
      const convId = conv.id;
      return {
        ...user,
        conversation_id: convId,
        lastMessage:
          messages.get(convId) ?? conv.latest_message?.message ?? null,
        lastMessageSenderId:
          senders.get(convId) ?? conv.latest_message?.sender_id ?? null,
        timestamp:
          timestamps.get(convId) ??
          (conv.latest_message
            ? new Date(conv.latest_message.created_at).getTime()
            : 0),
        unreadCount:
          selectedUser?.conversation_id === convId
            ? 0
            : (unreadMap.get(convId) ?? 0),
      };
    });

    const withoutConv = otherUsers.map((u) => ({
      ...u,
      timestamp: 0,
      conversation_id: null,
      lastMessageSenderId: null,
      unreadCount: 0,
    }));

    return [...withConv, ...withoutConv].sort((a, b) => b.timestamp - a.timestamp);
  }, [conversations, otherUsers, sidebarMaps, unreadMap, selectedUser, authUser.id]);

  // ---------------------------------------------------------------------------
  // Derived: messages for the open conversation — O(1) lookup, then sort once
  // ---------------------------------------------------------------------------
  const filteredMessages = useMemo(() => {
    const convId = selectedUser?.conversation_id;
    if (!convId) return [];

    const convMap = convMessages.get(convId);
    if (!convMap) return [];

    return Array.from(convMap.values()).sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }, [convMessages, selectedUser?.conversation_id]);

  // ---------------------------------------------------------------------------
  // Select user
  // ---------------------------------------------------------------------------
  const handleSelectUser = useCallback((user) => {
    // Don't re-fetch if already selected
    if (selectedUserRef.current?.id === user.id) return;

    setSelectedUser(user);
    selectedUserRef.current = user;
    setIsLoading(true);

    // Clear unread for this conversation
    if (user.conversation_id) {
      setUnreadMap((prev) => {
        if ((prev.get(user.conversation_id) ?? 0) === 0) return prev;
        const map = new Map(prev);
        map.set(user.conversation_id, 0);
        return map;
      });
    }

    router.get(
      routePath,
      { selected: user.id },
      {
        preserveState: true,
        replace: true,
        only: ["chatHistory", "conversations", "otherUsers"],
        onFinish: () => setIsLoading(false),
      }
    );

    //  mark seen
    if (user.conversation_id) {
      axios.post("/messages/seen", {
        conversation_id: user.conversation_id,
      });
    }
  }, [routePath]);

  // ---------------------------------------------------------------------------
  // Send message
  // ---------------------------------------------------------------------------
  const handleSend = useCallback((text) => {
    if (!selectedUserRef.current || !text.trim()) return;

    const user     = selectedUserRef.current;
    const clientId = uuidv4();
    const convId   = user.conversation_id;
    const now      = new Date().toISOString();

    const optimistic = {
      id: clientId,
      client_id: clientId,
      message: text,
      sender_id: authUserRef.current.id,
      receiver_id: user.id,
      conversation_id: convId,
      created_at: now,
      status: "sending",
    };

    // Optimistic: chat bubble
    if (convId) {
      setConvMessages((prev) => {
        const convMap = new Map(prev.get(convId) ?? []);
        convMap.set(clientId, optimistic);
        const next = new Map(prev);
        next.set(convId, convMap);
        return next;
      });
    }

    // Optimistic: sidebar
    if (convId) {
      setSidebarMaps((prev) => {
        const messages   = new Map(prev.messages);
        const timestamps = new Map(prev.timestamps);
        const senders    = new Map(prev.senders);
        messages.set(convId, text);
        timestamps.set(convId, Date.now());
        senders.set(convId, authUserRef.current.id);
        return { ...prev, messages, timestamps, senders };
      });
    }

    router.post(
      "/messages",
      { message: text, receiver_id: user.id, client_id: clientId },
      {
        preserveScroll: true,
        only: ["conversations"],
        onSuccess: (page) => {
          const updatedConvs = page.props.conversations ?? [];

          // If first message — wire up the new conversation
          if (!convId) {
            const newConv = updatedConvs.find((c) =>
              c.users.some((u) => u.id === user.id)
            );
            if (newConv) {
              const newUser = { ...user, conversation_id: newConv.id };
              setSelectedUser(newUser);
              selectedUserRef.current = newUser;

              // Move optimistic message into proper conv bucket
              setConvMessages((prev) => {
                const convMap = new Map();
                convMap.set(clientId, { ...optimistic, conversation_id: newConv.id });
                const next = new Map(prev);
                next.set(newConv.id, convMap);
                return next;
              });

              subscribe(newConv.id);
            }
          }
        },
        onError: () => {
          if (!convId) return;
          setConvMessages((prev) => {
            const convMap = new Map(prev.get(convId) ?? []);
            if (convMap.has(clientId)) {
              convMap.set(clientId, { ...convMap.get(clientId), status: "failed" });
            }
            const next = new Map(prev);
            next.set(convId, convMap);
            return next;
          });
        },
      }
    );
  }, [subscribe]);

  const sendTyping = useCallback(
    debounce((convId) => {
      axios.post("/typing", { conversation_id: convId });
    }, 300),
    []
  );

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
  };
}