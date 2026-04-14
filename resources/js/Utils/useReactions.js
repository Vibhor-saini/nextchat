/**
 * useReactions.js
 *
 * Manages message reactions with:
 * - Optimistic toggle (instant UI feedback)
 * - Debounced POST to /messages/{id}/reactions
 * - Real-time sync via Echo .reaction.updated event
 * - Zero redundant re-renders via ref-based pending state
 *
 * Laravel expects:
 *   POST /messages/{messageId}/reactions  { emoji: string }
 *   → toggles the reaction for the authed user
 *
 * Laravel broadcasts on conversation channel:
 *   .reaction.updated  { message_id, reactions: { [emoji]: { count, users: [id,...] } } }
 */

import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";

// How long to wait before firing the real API call after an optimistic toggle.
// Rapid re-taps within this window are collapsed into one request.
const DEBOUNCE_MS = 400;

export default function useReactions({ convId, authUserId, onMessageRef }) {
  // reactionStore: { [messageId]: { [emoji]: { count: number, users: number[] } } }
  const [reactionStore, setReactionStore] = useState({});

  // Pending debounce timers keyed by `${messageId}:${emoji}`
  const pendingTimers = useRef({});

  // ── Subscribe to Echo reaction events ──────────────────────────────────────
  // We piggyback on the already-registered conversation channel rather than
  // creating a new subscription. The channel is passed via the registry ref
  // from useChat so we don't double-subscribe.
  useEffect(() => {
    if (!convId || !window.Echo) return;

    const channel = window.Echo.private(`conversation.${convId}`);
    channel.listen(".reaction.updated", (e) => {
      setReactionStore((prev) => ({
        ...prev,
        [e.message_id]: e.reactions ?? {},
      }));
    });

    // No need to leave — useChat already manages channel lifecycle.
    // Just stop listening to this specific event on cleanup.
    return () => {
      channel.stopListening(".reaction.updated");
    };
  }, [convId]);

  // ── Toggle reaction ─────────────────────────────────────────────────────────
  const toggleReaction = useCallback((messageId, emoji) => {
    const timerKey = `${messageId}:${emoji}`;

    // 1. Optimistic update
    setReactionStore((prev) => {
      const msgReactions = { ...(prev[messageId] ?? {}) };
      const existing     = msgReactions[emoji];
      const alreadyReacted = existing?.users?.includes(authUserId);

      if (alreadyReacted) {
        // Remove
        const users = existing.users.filter((id) => id !== authUserId);
        if (users.length === 0) {
          const next = { ...msgReactions };
          delete next[emoji];
          return { ...prev, [messageId]: next };
        }
        return {
          ...prev,
          [messageId]: { ...msgReactions, [emoji]: { count: users.length, users } },
        };
      } else {
        // Add
        const users = [...(existing?.users ?? []), authUserId];
        return {
          ...prev,
          [messageId]: { ...msgReactions, [emoji]: { count: users.length, users } },
        };
      }
    });

    // 2. Debounced API call — collapses rapid taps
    clearTimeout(pendingTimers.current[timerKey]);
    pendingTimers.current[timerKey] = setTimeout(() => {
      axios
        .post(`/messages/${messageId}/reactions`, { emoji })
        .catch(() => {
          // On failure: revert by re-fetching reactions for this message.
          // Silent fail is acceptable for non-critical feature.
          axios
            .get(`/messages/${messageId}/reactions`)
            .then((res) => {
              setReactionStore((prev) => ({
                ...prev,
                [messageId]: res.data ?? {},
              }));
            })
            .catch(() => {});
        });
      delete pendingTimers.current[timerKey];
    }, DEBOUNCE_MS);
  }, [authUserId]);

  // ── Get reactions for a specific message ───────────────────────────────────
  const getReactions = useCallback((messageId) => {
    return reactionStore[messageId] ?? {};
  }, [reactionStore]);

  // ── Seed reactions from chat history on load ───────────────────────────────
  const seedReactions = useCallback((messages) => {
    setReactionStore((prev) => {
      const next = { ...prev };
      messages.forEach((msg) => {
        if (msg.reactions && !next[msg.id]) {
          next[msg.id] = msg.reactions;
        }
      });
      return next;
    });
  }, []);

  return { toggleReaction, getReactions, seedReactions };
}