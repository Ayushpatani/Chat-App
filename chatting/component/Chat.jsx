import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Chat = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  const authHeaders = useMemo(
    () => ({ "auth-token": token || "", "Content-Type": "application/json" }),
    [token]
  );

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    const loadMe = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${ENDPOINT}/api/auth/getuser`, {
          headers: { "auth-token": token },
        });
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (!response.ok) throw new Error("Unable to load your profile");
        setLoggedInUser(await response.json());
      } catch (err) {
        setError(err.message);
      }
    };
    loadMe();
  }, [token, navigate]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!loggedInUser) return;
      try {
        setLoading(true);
        const response = await fetch(`${ENDPOINT}/api/auth/getalluser`, {
          headers: { "auth-token": token },
        });
        if (!response.ok) throw new Error("Unable to load users");
        setUsers(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [loggedInUser, token]);

  useEffect(() => {
    if (!loggedInUser?._id) return;

    const socket = io(ENDPOINT, { withCredentials: true });
    socketRef.current = socket;
    socket.emit("join", loggedInUser._id);

    socket.on("online_users", (ids) => setOnlineUsers(ids));

    socket.on("receive_message", (message) => {
      const senderId = typeof message.sender === "object" ? message.sender?._id : message.sender;
      if (senderId === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
        markConversationSeen(selectedUser._id, socket);
      }
    });

    socket.on("typing", (senderId) => {
      if (senderId === selectedUser?._id) setTypingUser(senderId);
    });

    socket.on("stop_typing", (senderId) => {
      if (senderId === selectedUser?._id) setTypingUser(null);
    });

    socket.on("messages_seen", ({ by }) => {
      if (by === selectedUser?._id) {
        setMessages((prev) =>
          prev.map((msg) => ({ ...msg, seen: true, seenAt: msg.seenAt || new Date().toISOString() }))
        );
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loggedInUser?._id, selectedUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const markConversationSeen = async (otherUserId, socket = socketRef.current) => {
    if (!otherUserId) return;
    try {
      await fetch(`${ENDPOINT}/api/message/seen/${otherUserId}`, {
        method: "PATCH",
        headers: authHeaders,
      });
      socket?.emit("messages_seen", {
        by: loggedInUser?._id,
        withUser: otherUserId,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setTypingUser(null);
    setError("");

    try {
      const response = await fetch(`${ENDPOINT}/api/message/${user._id}`, {
        headers: { "auth-token": token },
      });
      if (!response.ok) throw new Error("Unable to load messages");
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
      await markConversationSeen(user._id);
    } catch (err) {
      setMessages([]);
      setError(err.message);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !selectedUser) return;

    try {
      const response = await fetch(`${ENDPOINT}/api/message/send`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ receiver: selectedUser._id, content }),
      });

      if (!response.ok) throw new Error("Message could not be sent");
      const savedMessage = await response.json();
      setMessages((prev) => [...prev, savedMessage]);
      setInput("");
      socketRef.current?.emit("send_message", savedMessage);
      socketRef.current?.emit("stop_typing", {
        sender: loggedInUser._id,
        receiver: selectedUser._id,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
    if (!selectedUser || !socketRef.current) return;

    socketRef.current.emit("typing", {
      sender: loggedInUser._id,
      receiver: selectedUser._id,
    });

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", {
        sender: loggedInUser._id,
        receiver: selectedUser._id,
      });
    }, 1200);
  };

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const isOnline = (id) => onlineUsers.includes(String(id));
  const senderId = (message) =>
    typeof message.sender === "object" ? message.sender?._id : message.sender;

  const formatTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="chat-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-avatar">C</div>
          <div>
            <h2>Chatting</h2>
            <span>{loggedInUser?.name || "Loading..."}</span>
          </div>
          <button className="ghost-btn" onClick={logout} title="Logout">↪</button>
        </div>

        <div className="search-wrap">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
          />
        </div>

        <div className="section-title">CONVERSATIONS</div>
        <div className="user-list">
          {loading && <div className="empty">Loading users...</div>}
          {!loading && filteredUsers.length === 0 && <div className="empty">No users found</div>}
          {filteredUsers.map((user) => (
            <button
              key={user._id}
              className={`user-card ${selectedUser?._id === user._id ? "active" : ""}`}
              onClick={() => handleUserSelect(user)}
            >
              <div className="avatar-wrap">
                <img src={user.pic} alt={user.name} className="avatar" />
                <span className={`presence ${isOnline(user._id) ? "online" : ""}`} />
              </div>
              <div className="user-meta">
                <strong>{user.name}</strong>
                <span>{isOnline(user._id) ? "Online" : user.email || "Offline"}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="conversation">
        {selectedUser ? (
          <>
            <header className="conversation-header">
              <div className="avatar-wrap">
                <img src={selectedUser.pic} alt={selectedUser.name} className="avatar large" />
                <span className={`presence ${isOnline(selectedUser._id) ? "online" : ""}`} />
              </div>
              <div>
                <h3>{selectedUser.name}</h3>
                <span>{typingUser ? "typing..." : isOnline(selectedUser._id) ? "Online now" : "Offline"}</span>
              </div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            <section className="messages">
              {messages.length === 0 && (
                <div className="start-card">
                  <div className="bubble-icon">💬</div>
                  <h2>Start a conversation</h2>
                  <p>Send your first message to {selectedUser.name}.</p>
                </div>
              )}

              {messages.map((message, index) => {
                const mine = senderId(message) === loggedInUser?._id;
                return (
                  <div key={message._id || `${message.createdAt}-${index}`} className={`message-row ${mine ? "mine" : "theirs"}`}>
                    <div className="message-bubble">
                      <div>{message.content}</div>
                      <div className="message-meta">
                        <span>{formatTime(message.createdAt)}</span>
                        {mine && <span title={message.seen ? "Seen" : "Sent"}>{message.seen ? "✓✓" : "✓"}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUser && <div className="typing-indicator"><span /><span /><span /></div>}
              <div ref={messagesEndRef} />
            </section>

            <footer className="composer">
              <input
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${selectedUser.name}...`}
              />
              <button onClick={handleSend} disabled={!input.trim()}>Send</button>
            </footer>
          </>
        ) : (
          <div className="start-card centered">
            <div className="bubble-icon">💬</div>
            <h2>Start a conversation</h2>
            <p>Select someone from the sidebar to start chatting.</p>
          </div>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #0b0d12; color: #f8fafc; font-family: Inter, system-ui, sans-serif; }
        button, input { font: inherit; }
        .chat-shell { height: 100vh; display: grid; grid-template-columns: 360px 1fr; background: #0b0d12; }
        .sidebar { border-right: 1px solid #232631; background: #11131a; display: flex; flex-direction: column; min-width: 0; }
        .brand-row { display: flex; align-items: center; gap: 12px; padding: 22px; border-bottom: 1px solid #232631; }
        .brand-avatar { width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; font-weight: 800; background: linear-gradient(135deg,#7c3aed,#a855f7); }
        .brand-row h2 { margin: 0; font-size: 21px; }
        .brand-row span { color: #8e95a6; font-size: 12px; }
        .ghost-btn { margin-left: auto; border: 1px solid #2c3040; color: #d9dded; background: #171a23; border-radius: 10px; padding: 8px 11px; cursor: pointer; }
        .search-wrap { margin: 18px 20px 10px; padding: 0 14px; height: 50px; border: 1px solid #292d39; border-radius: 14px; display: flex; align-items: center; gap: 9px; background: #171a22; }
        .search-wrap input { width: 100%; border: 0; outline: 0; background: transparent; color: white; }
        .section-title { padding: 15px 22px 8px; color: #8e95a6; font-size: 12px; font-weight: 800; letter-spacing: .12em; }
        .user-list { overflow-y: auto; padding: 6px 12px 20px; }
        .user-card { width: 100%; border: 0; background: transparent; color: white; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; text-align: left; cursor: pointer; }
        .user-card:hover, .user-card.active { background: #1b1e29; }
        .avatar-wrap { position: relative; flex: 0 0 auto; }
        .avatar { width: 44px; height: 44px; object-fit: cover; border-radius: 50%; background: #252938; }
        .avatar.large { width: 48px; height: 48px; }
        .presence { position: absolute; width: 12px; height: 12px; border-radius: 50%; right: 0; bottom: 1px; background: #5b6270; border: 2px solid #11131a; }
        .presence.online { background: #22c55e; }
        .user-meta { min-width: 0; display: flex; flex-direction: column; }
        .user-meta strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-meta span { color: #868d9d; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .empty { padding: 28px 10px; color: #747b8c; text-align: center; }
        .conversation { min-width: 0; display: flex; flex-direction: column; position: relative; }
        .conversation-header { height: 82px; border-bottom: 1px solid #202430; display: flex; align-items: center; gap: 12px; padding: 0 24px; background: #0e1016; }
        .conversation-header h3 { margin: 0 0 2px; }
        .conversation-header span { color: #8d94a4; font-size: 12px; }
        .messages { flex: 1; overflow-y: auto; padding: 26px; }
        .message-row { display: flex; margin: 8px 0; }
        .message-row.mine { justify-content: flex-end; }
        .message-bubble { max-width: min(620px, 78%); padding: 10px 13px 7px; border-radius: 16px; line-height: 1.45; word-break: break-word; }
        .mine .message-bubble { background: linear-gradient(135deg,#6d28d9,#8b5cf6); border-bottom-right-radius: 5px; }
        .theirs .message-bubble { background: #1a1d27; border: 1px solid #292d39; border-bottom-left-radius: 5px; }
        .message-meta { display: flex; justify-content: flex-end; gap: 6px; margin-top: 4px; opacity: .75; font-size: 10px; }
        .composer { padding: 16px 22px 20px; display: flex; gap: 10px; border-top: 1px solid #202430; background: #0e1016; }
        .composer input { flex: 1; min-width: 0; border: 1px solid #2a2e3a; border-radius: 15px; background: #171a22; color: white; outline: none; padding: 14px 16px; }
        .composer input:focus { border-color: #7c3aed; }
        .composer button { border: 0; border-radius: 14px; padding: 0 20px; background: #7c3aed; color: white; font-weight: 700; cursor: pointer; }
        .composer button:disabled { opacity: .45; cursor: not-allowed; }
        .start-card { text-align: center; color: #8d94a4; margin: 80px auto; }
        .start-card.centered { margin: auto; }
        .start-card h2 { color: white; margin: 14px 0 6px; }
        .start-card p { margin: 0; }
        .bubble-icon { width: 74px; height: 74px; border-radius: 22px; display: grid; place-items: center; margin: auto; font-size: 30px; background: #21183a; }
        .typing-indicator { width: 54px; margin: 10px 0; padding: 10px; border-radius: 14px; background: #1a1d27; display: flex; gap: 4px; }
        .typing-indicator span { width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: blink 1s infinite alternate; }
        .typing-indicator span:nth-child(2) { animation-delay: .2s; }
        .typing-indicator span:nth-child(3) { animation-delay: .4s; }
        .error-banner { margin: 10px 20px 0; padding: 10px 12px; border-radius: 10px; background: #3a171b; color: #fecaca; font-size: 13px; }
        @keyframes blink { from { opacity: .35; transform: translateY(1px); } to { opacity: 1; transform: translateY(-1px); } }
        @media (max-width: 760px) {
          .chat-shell { grid-template-columns: 110px 1fr; }
          .brand-row { padding: 14px; justify-content: center; }
          .brand-row > div:not(.brand-avatar), .brand-row .ghost-btn, .search-wrap, .section-title, .user-meta { display: none; }
          .user-card { justify-content: center; }
          .sidebar { overflow: hidden; }
          .messages { padding: 15px; }
          .conversation-header { padding: 0 15px; }
          .composer { padding: 12px; }
        }
      `}</style>
    </div>
  );
};

export default Chat;
