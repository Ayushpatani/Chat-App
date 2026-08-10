import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:8000";

let socket;
let typingTimeout;

const Chat = () => {
    const [users, setUsers] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [search, setSearch] = useState("");

    const messagesEndRef = useRef(null);

    /* =========================
       AUTO SCROLL
    ========================= */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    /* =========================
       GET LOGGED IN USER
    ========================= */

    useEffect(() => {
        const getLoggedInUser = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/api/auth/getuser",
                    {
                        headers: {
                            "auth-token": localStorage.getItem("token"),
                        },
                    }
                );

                const data = await res.json();

                setLoggedInUser(data);
            } catch (error) {
                console.error("Error getting user:", error);
            }
        };

        getLoggedInUser();
    }, []);

    /* =========================
       GET ALL USERS
    ========================= */

    useEffect(() => {
        if (!loggedInUser) return;

        const getUsers = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/api/auth/getalluser"
                );

                const data = await res.json();

                setUsers(
                    data.filter(
                        (u) => u._id !== loggedInUser._id
                    )
                );
            } catch (error) {
                console.error("Error getting users:", error);
            }
        };

        getUsers();
    }, [loggedInUser]);

    /* =========================
       SOCKET SETUP
    ========================= */

    useEffect(() => {
        if (!loggedInUser?._id) return;

        socket = io(ENDPOINT, {
            withCredentials: true,
        });

        socket.emit("join", loggedInUser._id);

        socket.on("receive_message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on("typing", (senderId) => {
            if (senderId === selectedUser?._id) {
                setTyping(true);
            }
        });

        socket.on("stop_typing", (senderId) => {
            if (senderId === selectedUser?._id) {
                setTyping(false);
            }
        });

        return () => {
            socket.off("receive_message");
            socket.off("typing");
            socket.off("stop_typing");
            socket.disconnect();
        };
    }, [loggedInUser, selectedUser]);

    /* =========================
       SELECT USER
    ========================= */

    const handleUserSelect = async (user) => {
        setSelectedUser(user);
        setTyping(false);

        try {
            const res = await fetch(
                `http://localhost:8000/api/message/${loggedInUser._id}/${user._id}`
            );

            const data = await res.json();

            setMessages(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error) {
            console.error(
                "Error getting messages:",
                error
            );

            setMessages([]);
        }
    };

    /* =========================
       SEND MESSAGE
    ========================= */

    const handleSend = async () => {
        if (!input.trim() || !selectedUser) return;

        const newMsg = {
            sender: loggedInUser._id,
            receiver: selectedUser._id,
            content: input.trim(),
        };

        try {
            await fetch(
                "http://localhost:8000/api/message/send",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newMsg),
                }
            );

            socket.emit(
                "send_message",
                newMsg
            );

            setMessages((prev) => [
                ...prev,
                newMsg,
            ]);

            setInput("");

            socket.emit(
                "stop_typing",
                {
                    sender: loggedInUser._id,
                    receiver: selectedUser._id,
                }
            );
        } catch (error) {
            console.error(
                "Error sending message:",
                error
            );
        }
    };

    /* =========================
       TYPING
    ========================= */

    const handleInputChange = (e) => {
        const value = e.target.value;

        setInput(value);

        if (!selectedUser || !socket) return;

        socket.emit("typing", {
            sender: loggedInUser._id,
            receiver: selectedUser._id,
        });

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        typingTimeout = setTimeout(() => {
            socket.emit("stop_typing", {
                sender: loggedInUser._id,
                receiver: selectedUser._id,
            });
        }, 2000);
    };

    /* =========================
       SEARCH USERS
    ========================= */

    const filteredUsers = users.filter((user) =>
        user.name
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    /* =========================
       AVATAR
    ========================= */

    const getInitial = (name) => {
        return name
            ? name.charAt(0).toUpperCase()
            : "?";
    };

    return (
        <>
            <style>{`

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    background: #090a0f;
                    font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }

                /* =================================
                   MAIN CHAT CONTAINER
                ================================= */

                .chat-container {
                    height: 100vh;
                    width: 100%;
                    display: flex;
                    overflow: hidden;
                    background: #0d0e13;
                    color: white;
                }

                /* =================================
                   SIDEBAR
                ================================= */

                .chat-sidebar {
                    width: 330px;
                    height: 100vh;
                    flex-shrink: 0;

                    display: flex;
                    flex-direction: column;

                    background: #111218;

                    border-right:
                        1px solid
                        rgba(255,255,255,0.07);
                }

                /* =================================
                   SIDEBAR HEADER
                ================================= */

                .sidebar-header {
                    height: 75px;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding: 0 20px;

                    border-bottom:
                        1px solid
                        rgba(255,255,255,0.06);
                }

                .app-brand {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                }

                .app-logo {
                    width: 38px;
                    height: 38px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 11px;

                    background:
                        linear-gradient(
                            135deg,
                            #6366f1,
                            #a855f7
                        );

                    font-size: 17px;
                    font-weight: 800;

                    box-shadow:
                        0 8px 25px
                        rgba(99,102,241,0.25);
                }

                .app-name {
                    font-size: 17px;
                    font-weight: 700;
                }

                .header-icon {
                    width: 34px;
                    height: 34px;

                    border: none;
                    border-radius: 9px;

                    background: #1a1b22;

                    color: #a1a1aa;

                    cursor: pointer;

                    transition: 0.2s;
                }

                .header-icon:hover {
                    background: #272833;
                    color: white;
                }

                /* =================================
                   SEARCH
                ================================= */

                .search-container {
                    padding: 16px;
                }

                .search-box {
                    height: 43px;

                    display: flex;
                    align-items: center;

                    background: #191a21;

                    border:
                        1px solid
                        #272832;

                    border-radius: 11px;

                    padding: 0 13px;

                    color: #71717a;
                }

                .search-box span {
                    font-size: 16px;
                    margin-right: 9px;
                }

                .search-box input {
                    flex: 1;

                    height: 100%;

                    border: none;
                    outline: none;

                    background: transparent;

                    color: white;

                    font-size: 13px;
                }

                .search-box input::placeholder {
                    color: #52525b;
                }

                /* =================================
                   USER LIST
                ================================= */

                .users-title {
                    padding: 0 20px 10px;

                    color: #71717a;

                    font-size: 11px;

                    font-weight: 700;

                    text-transform: uppercase;

                    letter-spacing: 1px;
                }

                .users-list {
                    flex: 1;

                    overflow-y: auto;

                    padding: 0 10px;
                }

                .users-list::-webkit-scrollbar {
                    width: 4px;
                }

                .users-list::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 10px;
                }

                /* =================================
                   USER ITEM
                ================================= */

                .user-item {
                    width: 100%;

                    display: flex;
                    align-items: center;

                    gap: 12px;

                    padding: 11px 10px;

                    border-radius: 11px;

                    margin-bottom: 3px;

                    cursor: pointer;

                    transition:
                        background 0.2s ease;
                }

                .user-item:hover {
                    background: #191a21;
                }

                .user-item.active {
                    background:
                        linear-gradient(
                            90deg,
                            rgba(99,102,241,0.18),
                            rgba(99,102,241,0.07)
                        );
                }

                /* =================================
                   AVATAR
                ================================= */

                .avatar-wrapper {
                    position: relative;
                    flex-shrink: 0;
                }

                .avatar {
                    width: 43px;
                    height: 43px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 50%;

                    background:
                        linear-gradient(
                            135deg,
                            #6366f1,
                            #8b5cf6
                        );

                    color: white;

                    font-size: 16px;

                    font-weight: 700;
                }

                .online-dot {
                    position: absolute;

                    width: 11px;
                    height: 11px;

                    right: 0;
                    bottom: 1px;

                    border-radius: 50%;

                    background: #22c55e;

                    border:
                        2px solid #111218;
                }

                /* =================================
                   USER INFO
                ================================= */

                .user-info {
                    min-width: 0;
                    flex: 1;
                }

                .user-name {
                    color: #e4e4e7;

                    font-size: 14px;

                    font-weight: 600;

                    white-space: nowrap;

                    overflow: hidden;

                    text-overflow: ellipsis;
                }

                .user-status {
                    color: #71717a;

                    font-size: 12px;

                    margin-top: 3px;
                }

                /* =================================
                   CHAT AREA
                ================================= */

                .chat-main {
                    flex: 1;

                    min-width: 0;

                    height: 100vh;

                    display: flex;

                    flex-direction: column;

                    background: #0d0e13;
                }

                /* =================================
                   CHAT HEADER
                ================================= */

                .chat-header {
                    height: 75px;

                    flex-shrink: 0;

                    display: flex;

                    align-items: center;

                    padding: 0 25px;

                    border-bottom:
                        1px solid
                        rgba(255,255,255,0.06);

                    background:
                        rgba(13,14,19,0.95);
                }

                .chat-user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .chat-avatar {
                    width: 42px;
                    height: 42px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 50%;

                    background:
                        linear-gradient(
                            135deg,
                            #6366f1,
                            #a855f7
                        );

                    font-weight: 700;
                }

                .chat-user-name {
                    font-size: 15px;
                    font-weight: 650;
                }

                .chat-user-status {
                    color: #22c55e;
                    font-size: 12px;
                    margin-top: 3px;
                }

                /* =================================
                   EMPTY CHAT
                ================================= */

                .empty-chat {
                    flex: 1;

                    display: flex;

                    flex-direction: column;

                    justify-content: center;

                    align-items: center;

                    color: #71717a;

                    text-align: center;
                }

                .empty-icon {
                    width: 75px;
                    height: 75px;

                    display: flex;

                    align-items: center;
                    justify-content: center;

                    border-radius: 22px;

                    background:
                        linear-gradient(
                            135deg,
                            rgba(99,102,241,0.15),
                            rgba(168,85,247,0.15)
                        );

                    font-size: 32px;

                    margin-bottom: 20px;
                }

                .empty-chat h2 {
                    color: #e4e4e7;

                    font-size: 21px;

                    margin: 0 0 8px;
                }

                .empty-chat p {
                    margin: 0;

                    color: #52525b;

                    font-size: 13px;
                }

                /* =================================
                   MESSAGES
                ================================= */

                .messages-area {
                    flex: 1;

                    overflow-y: auto;

                    padding: 30px 7%;

                    background:
                        radial-gradient(
                            circle at 50% 50%,
                            rgba(99,102,241,0.025),
                            transparent 45%
                        );
                }

                .messages-area::-webkit-scrollbar {
                    width: 5px;
                }

                .messages-area::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 10px;
                }

                .message-row {
                    display: flex;

                    margin-bottom: 13px;
                }

                .message-row.sent {
                    justify-content: flex-end;
                }

                .message-row.received {
                    justify-content: flex-start;
                }

                .message-bubble {
                    max-width: min(65%, 600px);

                    padding: 11px 15px;

                    border-radius: 16px;

                    font-size: 14px;

                    line-height: 1.5;

                    position: relative;

                    word-break: break-word;
                }

                .message-row.sent
                .message-bubble {
                    background:
                        linear-gradient(
                            135deg,
                            #6366f1,
                            #7c3aed
                        );

                    color: white;

                    border-bottom-right-radius: 5px;

                    box-shadow:
                        0 6px 18px
                        rgba(99,102,241,0.13);
                }

                .message-row.received
                .message-bubble {
                    background: #1b1c23;

                    color: #e4e4e7;

                    border:
                        1px solid
                        #272832;

                    border-bottom-left-radius: 5px;
                }

                .message-time {
                    display: block;

                    margin-top: 5px;

                    font-size: 10px;

                    opacity: 0.55;

                    text-align: right;
                }

                /* =================================
                   TYPING
                ================================= */

                .typing-container {
                    height: 25px;

                    padding-left: 7%;

                    color: #71717a;

                    font-size: 12px;
                }

                .typing-dots {
                    display: inline-flex;

                    gap: 3px;

                    margin-left: 5px;
                }

                .typing-dots span {
                    width: 4px;
                    height: 4px;

                    border-radius: 50%;

                    background: #818cf8;

                    animation:
                        typing 1.2s infinite;
                }

                .typing-dots span:nth-child(2) {
                    animation-delay: 0.15s;
                }

                .typing-dots span:nth-child(3) {
                    animation-delay: 0.3s;
                }

                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }

                    30% {
                        transform: translateY(-4px);
                        opacity: 1;
                    }
                }

                /* =================================
                   MESSAGE INPUT
                ================================= */

                .message-input-area {
                    padding: 15px 7% 20px;

                    border-top:
                        1px solid
                        rgba(255,255,255,0.06);

                    background: #0d0e13;
                }

                .message-input-wrapper {
                    display: flex;

                    align-items: center;

                    gap: 10px;

                    padding: 7px 8px 7px 16px;

                    background: #18191f;

                    border:
                        1px solid #272832;

                    border-radius: 15px;

                    transition:
                        border 0.2s ease;
                }

                .message-input-wrapper:focus-within {
                    border-color:
                        rgba(99,102,241,0.6);
                }

                .message-input {
                    flex: 1;

                    height: 40px;

                    border: none;

                    outline: none;

                    background: transparent;

                    color: white;

                    font-size: 14px;
                }

                .message-input::placeholder {
                    color: #52525b;
                }

                .send-button {
                    width: 42px;
                    height: 42px;

                    border: none;

                    border-radius: 12px;

                    display: flex;

                    align-items: center;
                    justify-content: center;

                    background:
                        linear-gradient(
                            135deg,
                            #6366f1,
                            #8b5cf6
                        );

                    color: white;

                    font-size: 17px;

                    cursor: pointer;

                    transition:
                        all 0.2s ease;
                }

                .send-button:hover {
                    transform: scale(1.05);

                    box-shadow:
                        0 6px 20px
                        rgba(99,102,241,0.3);
                }

                .send-button:active {
                    transform: scale(0.95);
                }

                /* =================================
                   MOBILE
                ================================= */

                @media (max-width: 700px) {

                    .chat-sidebar {
                        width: 80px;
                    }

                    .app-name,
                    .users-title,
                    .search-container,
                    .user-info {
                        display: none;
                    }

                    .sidebar-header {
                        justify-content: center;
                        padding: 0;
                    }

                    .users-list {
                        padding: 10px 8px;
                    }

                    .user-item {
                        justify-content: center;
                        padding: 10px 0;
                    }

                    .avatar {
                        width: 44px;
                        height: 44px;
                    }

                    .chat-header {
                        padding: 0 15px;
                    }

                    .messages-area {
                        padding: 20px 15px;
                    }

                    .message-input-area {
                        padding: 10px 12px 15px;
                    }

                    .message-bubble {
                        max-width: 80%;
                    }

                    .typing-container {
                        padding-left: 15px;
                    }
                }

                @media (max-width: 450px) {

                    .chat-sidebar {
                        width: 65px;
                    }

                    .message-bubble {
                        max-width: 85%;
                    }
                }

            `}</style>

            <div className="chat-container">

                {/* =================================
                    SIDEBAR
                ================================= */}

                <aside className="chat-sidebar">

                    <div className="sidebar-header">

                        <div className="app-brand">

                            <div className="app-logo">
                                C
                            </div>

                            <div className="app-name">
                                Chatting
                            </div>

                        </div>

                        <button className="header-icon">
                            ⋯
                        </button>

                    </div>

                    {/* SEARCH */}

                    <div className="search-container">

                        <div className="search-box">

                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search people..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                    </div>

                    <div className="users-title">
                        Conversations
                    </div>

                    {/* USERS */}

                    <div className="users-list">

                        {filteredUsers.map((user) => (

                            <div
                                key={user._id}
                                className={`user-item ${
                                    selectedUser?._id === user._id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleUserSelect(user)
                                }
                            >

                                <div className="avatar-wrapper">

                                    <div className="avatar">
                                        {getInitial(user.name)}
                                    </div>

                                    <div className="online-dot"></div>

                                </div>

                                <div className="user-info">

                                    <div className="user-name">
                                        {user.name}
                                    </div>

                                    <div className="user-status">
                                        Available
                                    </div>

                                </div>

                            </div>

                        ))}

                        {filteredUsers.length === 0 && (

                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "30px 10px",
                                    color: "#52525b",
                                    fontSize: "13px",
                                }}
                            >
                                No users found
                            </div>

                        )}

                    </div>

                </aside>

                {/* =================================
                    CHAT
                ================================= */}

                <main className="chat-main">

                    {!selectedUser ? (

                        /* EMPTY STATE */

                        <div className="empty-chat">

                            <div className="empty-icon">
                                💬
                            </div>

                            <h2>
                                Start a conversation
                            </h2>

                            <p>
                                Select someone from the sidebar
                                to start chatting.
                            </p>

                        </div>

                    ) : (

                        <>
                            {/* CHAT HEADER */}

                            <header className="chat-header">

                                <div className="chat-user-info">

                                    <div className="avatar-wrapper">

                                        <div className="chat-avatar">
                                            {getInitial(
                                                selectedUser.name
                                            )}
                                        </div>

                                        <div className="online-dot"></div>

                                    </div>

                                    <div>

                                        <div className="chat-user-name">
                                            {selectedUser.name}
                                        </div>

                                        <div className="chat-user-status">
                                            ● Online
                                        </div>

                                    </div>

                                </div>

                            </header>

                            {/* MESSAGES */}

                            <div className="messages-area">

                                {messages.length === 0 ? (

                                    <div
                                        style={{
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#52525b",
                                            fontSize: "13px",
                                        }}
                                    >
                                        No messages yet. Say hello 👋
                                    </div>

                                ) : (

                                    messages.map((msg, index) => {

                                        const isSent =
                                            msg.sender ===
                                            loggedInUser?._id;

                                        return (

                                            <div
                                                key={
                                                    msg._id ||
                                                    index
                                                }
                                                className={`message-row ${
                                                    isSent
                                                        ? "sent"
                                                        : "received"
                                                }`}
                                            >

                                                <div className="message-bubble">

                                                    {msg.content}

                                                    <span className="message-time">
                                                        {new Date().toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                        );
                                    })

                                )}

                                <div
                                    ref={messagesEndRef}
                                />

                            </div>

                            {/* TYPING */}

                            <div className="typing-container">

                                {typing && (
                                    <>
                                        {selectedUser.name}
                                        {" is typing"}

                                        <span className="typing-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </span>
                                    </>
                                )}

                            </div>

                            {/* INPUT */}

                            <div className="message-input-area">

                                <div className="message-input-wrapper">

                                    <input
                                        type="text"
                                        className="message-input"
                                        value={input}
                                        placeholder="Write a message..."
                                        onChange={
                                            handleInputChange
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key ===
                                                "Enter"
                                            ) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                    />

                                    <button
                                        className="send-button"
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        style={{
                                            opacity:
                                                input.trim()
                                                    ? 1
                                                    : 0.5,
                                        }}
                                    >
                                        ➤
                                    </button>

                                </div>

                            </div>
                        </>

                    )}

                </main>

            </div>
        </>
    );
};

export default Chat;