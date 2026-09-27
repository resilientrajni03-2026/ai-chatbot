import { useEffect, useState } from 'react';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

function Icon({ name, size = 18 }) {
  const paths = {
    plus: <><path d="M12 5v14M5 12h14" /></>,
    pencil: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
    send: <><path d="m3 11 18-8-8 18-2-8-8-2Z" /><path d="m11 13 10-10" /></>,
    more: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5" /></>,
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>,
    chevron: <path d="m7 9 5 5 5-5" />,
  };

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function App() {
  const [files, setFiles] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/files`).then((response) => response.json()),
      fetch(`${API_URL}/chats`).then((response) => response.json()),
    ])
      .then(([fileData, chatData]) => {
        setFiles(fileData.files ?? []);
        setChats(chatData.chats ?? []);
        if (chatData.chats?.length) setSelectedChatId(chatData.chats[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    fetch(`${API_URL}/chats/${selectedChatId}/messages`)
      .then((response) => response.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]));
  }, [selectedChatId]);

  function createChat() {
    // A new DB chat is created only when the user submits the first message.
    setSelectedChatId(null);
    setMessages([]);
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;

    try {
      if (!selectedChatId) {
        // First message: backend creates the chat + message atomically.
        const response = await fetch(`${API_URL}/chats/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) return;

        const data = await response.json();

        setChats((current) => [
          data.chat,
          ...current.filter((chat) => chat.id !== data.chat.id),
        ]);
        setSelectedChatId(data.chat.id);
        setMessages([data.message]);
        setMessage('');
        return;
      }

      // Existing chat: save only the new message.
      const response = await fetch(`${API_URL}/chats/${selectedChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) return;

      const data = await response.json();

      setMessages((current) => [...current, data.message]);
      setChats((current) =>
        current
          .map((chat) =>
            chat.id === selectedChatId
              ? { ...chat, updated_at: data.message.created_at }
              : chat,
          )
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
      );
      setMessage('');
    } catch {}
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon name="spark" size={19} /></div>
          <div>
            <strong>AI Chat</strong>
            <span>Workspace</span>
          </div>
        </div>

        <button className="new-chat-button" onClick={createChat} type="button">
          <Icon name="plus" size={18} />
          <span>New chat</span>
          <kbd>⌘ K</kbd>
        </button>

        <div className="sidebar-section">
          <label className="section-label">Knowledge</label>
          <div className="file-picker">
            <Icon name="file" size={17} />
            <select defaultValue="" aria-label="Select uploaded file">
              <option value="" disabled>Select a file</option>
              {files.map((file) => (
                <option value={file.id} key={file.id}>{file.original_name}</option>
              ))}
            </select>
            <Icon name="chevron" size={15} />
          </div>
        </div>

        <div className="history-header">
          <span className="section-label">Recent chats</span>
          <button type="button" aria-label="Search chats"><Icon name="search" size={16} /></button>
        </div>

        <div className="history-list">
          {chats.length ? chats.map((chat) => (
            <button
              className={`history-item ${selectedChatId === chat.id ? 'active' : ''}`}
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              type="button"
            >
              <span className="history-dot" />
              <span className="history-title">{chat.title}</span>
              <span className="more-button"><Icon name="more" size={16} /></span>
            </button>
          )) : (
            <div className="empty-history">Your conversations will appear here.</div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>AI workspace</span>
          <span className="version">v0.1</span>
        </div>
      </aside>

      <main className="chat-panel">
        <header className="chat-header">
          <div>
            <span className="eyebrow">Workspace</span>
            <h1>AI Assistant</h1>
          </div>
          <div className="online-pill"><span /> Ready</div>
        </header>

        <div className="chat-messages">
          {!messages.length ? (
            <div className="welcome">
              <div className="welcome-icon"><Icon name="spark" size={25} /></div>
              <h2>What can I help you with?</h2>
              <p>Ask a question, explore a document, or start a new conversation.</p>
              <div className="suggestions">
                <button type="button" onClick={() => setMessage('Summarize this document')}>Summarize a document <span>↗</span></button>
                <button type="button" onClick={() => setMessage('Help me understand this')}>Explain something <span>↗</span></button>
              </div>
            </div>
          ) : messages.map((item) => (
            <div className={`message ${item.role}`} key={item.id}>
              <div className="message-bubble">{item.content}</div>
            </div>
          ))}
        </div>

        <form className="message-form" onSubmit={handleSubmit}>
          <div className="composer">
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message your AI assistant..."
              aria-label="Message"
            />
            <button className="send-button" type="submit" aria-label="Send message">
              <Icon name="send" size={18} />
            </button>
          </div>
          <div className="composer-hint">AI can make mistakes. Check important information.</div>
        </form>
      </main>
    </div>
  );
}

export default App;
