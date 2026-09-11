const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch (err) {
    console.error('API health check failed:', err);
    return false;
  }
}

export async function createConversation() {
  const res = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to create conversation: ${res.statusText}`);
  }
  return await res.json(); // { thread_id: string }
}

export async function listConversations() {
  const res = await fetch(`${API_BASE_URL}/conversations`);
  if (!res.ok) {
    throw new Error(`Failed to list conversations: ${res.statusText}`);
  }
  return await res.json(); // Array<{ thread_id: string }>
}

export async function getConversation(threadId) {
  const res = await fetch(`${API_BASE_URL}/conversations/${encodeURIComponent(threadId)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch conversation ${threadId}: ${res.statusText}`);
  }
  return await res.json(); // { thread_id: string, messages: Array<{ role: string, content: string }> }
}

export async function streamChat({ message, threadId, onToken, onDone, onError, signal }) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, thread_id: threadId || null }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by browser environment.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep remaining incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim(); // remove 'data:'
        if (!dataStr) continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === 'token') {
            if (onToken) onToken(parsed.content, parsed.thread_id);
          } else if (parsed.type === 'done') {
            if (onDone) onDone(parsed.thread_id);
          } else if (parsed.type === 'error') {
            if (onError) onError(new Error(parsed.error || 'Stream error occurred'));
          }
        } catch (e) {
          console.warn('Failed to parse SSE payload line:', trimmed, e);
        }
      }
    }

    // Process leftover buffer if any
    if (buffer.trim().startsWith('data:')) {
      const dataStr = buffer.trim().slice(5).trim();
      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.type === 'token' && onToken) onToken(parsed.content, parsed.thread_id);
        if (parsed.type === 'done' && onDone) onDone(parsed.thread_id);
      } catch (e) {
        // ignore incomplete payload at end of stream
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Stream aborted by client');
      return;
    }
    if (onError) onError(err);
  }
}
