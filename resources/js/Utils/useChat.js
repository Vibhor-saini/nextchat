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

  // Initialize messages
  useEffect(() => {
    const map = new Map();

    chatHistory.forEach((msg) => {
      map.set(msg.id, { ...msg, status: "sent" });
    });

    setMessagesMap(map);
  }, [chatHistory]);

  //  Realtime listener
  useEffect(() => {
    if (!selectedUser?.conversation_id) return;

    const channelName = `conversation.${selectedUser.conversation_id}`;
    const channel = window.Echo.private(channelName);

    channel.listen(".message.sent", (e) => {
      setMessagesMap((prev) => {
        const map = new Map(prev);

        if (e.client_id && map.has(e.client_id)) {
          // get temp message
          const temp = map.get(e.client_id);

          // remove temp
          map.delete(e.client_id);

          //  insert real message with REAL ID
          map.set(e.message.id, {
            ...e.message,
            client_id: e.client_id,
            status: "sent",
          });
        } else {
          // message from other user
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

  //  Users list
  const users = [
    ...conversations.map((conv) => {
      const user = conv.users.find((u) => u.id !== authUser.id);
      return {
        ...user,
        conversation_id: conv.id,
        lastMessage: conv.latest_message?.message,
        timestamp: conv.latest_message
          ? new Date(conv.latest_message.created_at).getTime()
          : 0,
      };
    }),
    ...otherUsers.map((u) => ({
      ...u,
      timestamp: 0,
      conversation_id: null,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Select user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    router.get(
      routePath,
      { selected: user.id },
      {
        preserveState: true,
        replace: true,
        only: ["chatHistory", "conversations", "otherUsers"],
      }
    );
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    return allMessages.filter((msg) => {
      if (!selectedUser) return false;

      if (
        msg.conversation_id &&
        selectedUser.conversation_id &&
        Number(msg.conversation_id) ===
          Number(selectedUser.conversation_id)
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

  // Send message (Optimistic + UUID)
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

    // O(1) insert
    setMessagesMap((prev) => {
      const map = new Map(prev);
      map.set(clientId, newMessage);
      return map;
    });

    router.post(
      "/messages",
      {
        message: text,
        receiver_id: selectedUser.id,
        client_id: clientId,
      },
      {
        preserveScroll: true,
        onError: () => {
          //  mark failed
          setMessagesMap((prev) => {
            const map = new Map(prev);
            if (map.has(clientId)) {
              map.set(clientId, {
                ...map.get(clientId),
                status: "failed",
              });
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
  };
}