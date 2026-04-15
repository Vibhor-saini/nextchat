/**
 * Processes conversations to create quick-lookup maps for the sidebar.
 */
export function buildSidebarMaps(conversations) {
    const messages = new Map();
    const timestamps = new Map();
    const senders = new Map();

    conversations.forEach((conv) => {
        const lm = conv.latest_message;
        if (lm) {
            messages.set(conv.id, lm.message);
            timestamps.set(conv.id, new Date(lm.created_at).getTime());
            senders.set(conv.id, lm.sender_id);
        }
    });

    return { messages, timestamps, senders };
}

/**
 * Standard debounce helper to limit frequent function calls.
 */
export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Formats a timestamp into a readable chat time.
 */
export function formatChatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}