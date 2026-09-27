function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <select className="file-select" defaultValue="">
          <option value="" disabled>
            Select Uploaded File
          </option>
        </select>

        <h2>History</h2>

        <div className="history-list">
          {[
            'Lorem Ipsum is simpl...',
            'How to implement Go...',
            'Next.js authenticati...',
            'Database architectur...',
            'API integration disc...',
          ].map((title, index) => (
            <button className="history-item" key={title}>
              <span>chat-{index + 1}</span>
              <span>{title}</span>
              <span>•••</span>
            </button>
          ))}
        </div>

        <button className="new-chat" aria-label="New chat">
          ↗
        </button>
      </aside>

      <main className="chat-panel">
        <div className="chat-messages" />

        <form className="message-form">
          <input
            type="text"
            placeholder="Type your message here..."
            aria-label="Message"
          />
          <button type="submit" aria-label="Send message">
            ➤
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
