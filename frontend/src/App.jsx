import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 11 18-8-8 18-2-8-8-2Z" />
      <path d="m11 13 10-10" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
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
        if (chatData.chats?.length) {
          setSelectedChatId(chatData.chats[0].id);
        }
      })
      .catch(() => {
        // The UI remains usable while the backend is unavailable.
      });
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

  async function createChat() {
    try {
      const response = await fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New chat' }),
      });

      if (!response.ok) return;

      const data = await response.json();
      setChats((current) => [data.chat, ...current]);
      setSelectedChatId(data.chat.id);
      setMessages([]);
    } catch {
      // Keep the interaction quiet if the API is unavailable.
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;

    let chatId = selectedChatId;

    if (!chatId) {
      try {
        const response = await fetch(`${API_URL}/chats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: content.slice(0, 45) }),
        });
        const data = await response.json();
        chatId = data.chat.id;
        setChats((current) => [data.chat, ...current]);
        setSelectedChatId(chatId);
      } catch {
        return;
      }
    }

    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) return;

      const data = await response.json();
      setMessages((current) => [...current, data.message]);
      setMessage('');
    } catch {
      // Keep typed text when the request fails.
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <select
          className="file-select"
          defaultValue=""
          aria-label="Select uploaded file"
        >
          <option value="" disabled>
            Select Uploaded File
          </option>
          {files.map((file) => (
            <option value={file.id} key={file.id}>
              {file.original_name}
            </option>
          ))}
        </select>

        <h2>History</h2>

        <div className="history-list">
          {chats.map((chat) => (
            <button
              className={`history-item ${selectedChatId === chat.id ? 'active' : ''}`}
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              type="button"
            >
              <span>{chat.id.slice(0, 6)}</span>
              <span className="history-title">{chat.title}</span>
              <span className="more-button"><MoreIcon /></span>
            </button>
          ))}
        </div>

        <button className="new-chat" onClick={createChat} aria-label="New chat" type="button">
          <PencilIcon />
        </button>
      </aside>

      <main className="chat-panel">
        <div className="chat-messages">
          {messages.map((item) => (
            <div className={`message ${item.role}`} key={item.id}>
              <div className="message-bubble">{item.content}</div>
            </div>
          ))}
        </div>

        <form className="message-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your message here..."
            aria-label="Message"
          />
          <button type="submit" aria-label="Send message">
            <SendIcon />
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
