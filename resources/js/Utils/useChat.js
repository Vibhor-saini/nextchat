import { useState, useEffect, useMemo } from "react";
import { usePage, router } from "@inertiajs/react";
import { v4 as uuidv4 } from "uuid";

export default function useChat(routePath = "/chat") {
  const {
    conversations = [],
    otherUsers = [],
    authUser,
    chatHistory = [],
  } = usePage().props;

  const [selectedUser, setSelectedUser] = useState(null);
  const [messagesMap, setMessagesMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Sidebar last message + timestamp + sender maps
  const [lastMessagesMap, setLastMessagesMap] = useState(() => {
    const map = new Map();
    conversations.forEach((conv) => {
      if (conv.latest_message) {
        map.set(conv.id, conv.latest_message.message);
      }
    });
    return map;
  });

  const [lastTimestampMap, setLastTimestampMap] = useState(() => {
    const map = new Map();
    conversations.forEach((conv) => {
      if (conv.latest_message) {
        map.set(conv.id, new Date(conv.latest_message.created_at).getTime());
      }
    });
    return map;
  });

  // Track who sent the last message per conversation
  const [lastSenderMap, setLastSenderMap] = useState(() => {
    const map = new Map();
    conversations.forEach((conv) => {
      if (conv.latest_message) {
        map.set(conv.id, conv.latest_message.sender_id);
      }
    });
    return map;
  });

  // Initialize messages from chatHistory
  useEffect(() => {
    const map = new Map();
    chatHistory.forEach((msg) => {
      map.set(msg.id, { ...msg, status: "sent" });
    });
    setMessagesMap(map);
  }, [chatHistory]);

  // Listen to ALL conversations for sidebar live updates
  useEffect(() => {
    if (!conversations.length) return;

    const channels = conversations.map((conv) => {
      const channelName = `conversation.${conv.id}`;
      const channel = window.Echo.private(channelName);

      channel.listen(".message.sent", (e) => {
        setLastMessagesMap((prev) => {
          const map = new Map(prev);
          map.set(e.message.conversation_id, e.message.message);
          return map;
        });

        setLastTimestampMap((prev) => {
          const map = new Map(prev);
          map.set(e.message.conversation_id, new Date(e.message.created_at).getTime());
          return map;
        });

        // Update sender tracking on live message
        setLastSenderMap((prev) => {
          const map = new Map(prev);
          map.set(e.message.conversation_id, e.message.sender_id);
          return map;
        });
      });

      return channelName;
    });

    return () => {
      channels.forEach((name) => window.Echo.leave(`private-${name}`));
    };
  }, [conversations.length]);

  // Listen to selected conversation for chat messages
  useEffect(() => {
    if (!selectedUser?.conversation_id) return;

    const channelName = `conversation.${selectedUser.conversation_id}`;
    const channel = window.Echo.private(channelName);

    channel.listen(".message.sent", (e) => {
      setMessagesMap((prev) => {
        const map = new Map(prev);

        if (e.client_id && map.has(e.client_id)) {
          const temp = map.get(e.client_id);
          map.delete(e.client_id);
          map.set(e.message.id, {
            ...e.message,
            client_id: e.client_id,
            status: "sent",
          });
        } else {
          map.set(e.message.id, {
            ...e.message,
            status: "sent",
          });
        }

        return map;
      });
    });

    return () => {
      window.Echo.leave(`private-${channelName}`);
    };
  }, [selectedUser?.conversation_id]);

  // Convert Map → sorted array
  const allMessages = useMemo(() => {
    return Array.from(messagesMap.values()).sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }, [messagesMap]);

  // Users list — reacts to lastMessagesMap + lastTimestampMap + lastSenderMap instantly
  const users = useMemo(() => {
    return [
      ...conversations.map((conv) => {
        const user = conv.users.find((u) => u.id !== authUser.id);
        return {
          ...user,
          conversation_id: conv.id,
          lastMessage: lastMessagesMap.get(conv.id) ?? conv.latest_message?.message,
          lastMessageSenderId: lastSenderMap.get(conv.id) ?? conv.latest_message?.sender_id ?? null,
          timestamp: lastTimestampMap.get(conv.id) ?? (
            conv.latest_message
              ? new Date(conv.latest_message.created_at).getTime()
              : 0
          ),
        };
      }),
      ...otherUsers.map((u) => ({
        ...u,
        timestamp: 0,
        conversation_id: null,
        lastMessageSenderId: null,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp);
  }, [conversations, otherUsers, lastMessagesMap, lastTimestampMap, lastSenderMap]);

  // Select user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsLoading(true);

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
  };

  // Filter messages for selected conversation
  const filteredMessages = useMemo(() => {
    return allMessages.filter((msg) => {
      if (!selectedUser) return false;

      if (
        msg.conversation_id &&
        selectedUser.conversation_id &&
        Number(msg.conversation_id) === Number(selectedUser.conversation_id)
      ) {
        return true;
      }

      const myId = Number(authUser.id);
      const theirId = Number(selectedUser.id);

      return (
        (msg.sender_id === myId && msg.receiver_id === theirId) ||
        (msg.sender_id === theirId &&
          (msg.receiver_id === myId || !msg.receiver_id))
      );
    });
  }, [allMessages, selectedUser]);

  // Send message with optimistic sidebar update
  const handleSend = (text) => {
    if (!selectedUser || !text.trim()) return;

    const clientId = uuidv4();

    const newMessage = {
      id: clientId,
      client_id: clientId,
      message: text,
      sender_id: authUser.id,
      receiver_id: selectedUser.id,
      conversation_id: selectedUser.conversation_id,
      created_at: new Date().toISOString(),
      status: "sending",
    };

    // Optimistic message in chat
    setMessagesMap((prev) => {
      const map = new Map(prev);
      map.set(clientId, newMessage);
      return map;
    });

    // Optimistic sidebar update — instant, no waiting for Echo
    if (selectedUser.conversation_id) {
      setLastMessagesMap((prev) => {
        const map = new Map(prev);
        map.set(selectedUser.conversation_id, text);
        return map;
      });
      setLastTimestampMap((prev) => {
        const map = new Map(prev);
        map.set(selectedUser.conversation_id, Date.now());
        return map;
      });
      // Optimistically mark current user as last sender
      setLastSenderMap((prev) => {
        const map = new Map(prev);
        map.set(selectedUser.conversation_id, authUser.id);
        return map;
      });
    }

    router.post(
      "/messages",
      {
        message: text,
        receiver_id: selectedUser.id,
        client_id: clientId,
      },
      {
        preserveScroll: true,
        only: ["conversations"],
        onError: () => {
          setMessagesMap((prev) => {
            const map = new Map(prev);
            if (map.has(clientId)) {
              map.set(clientId, { ...map.get(clientId), status: "failed" });
            }
            return map;
          });
        },
      }
    );
  };

  return {
    users,
    authUser,
    selectedUser,
    filteredMessages,
    handleSelectUser,
    handleSend,
    isLoading,
  };
}