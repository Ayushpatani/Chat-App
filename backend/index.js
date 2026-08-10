// server.js
const connectToMongo = require('./db');
const express = require("express");
const cors = require('cors');
const path = require('path');

connectToMongo();
const app = express();
const port = 8000;

app.use(cors({
    origin: [ "http://localhost:5173"],
    methods: ["GET", "POST"]
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use("/api/message", require("./routes/message"));

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Socket.IO setup
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true   // add this
    }
});

io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // join personal room
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`🔑 User joined room: ${userId}`);
    });

    // one-to-one messaging
    socket.on("send_message", (msg) => {
        console.log("📩 Direct Message:", msg);
        socket.to(msg.receiver).emit("receive_message", msg);
    });

    // typing events
    socket.on("typing", ({ sender, receiver }) => {
        socket.to(receiver).emit("typing", sender);
    });

    socket.on("stop_typing", ({ sender, receiver }) => {
        socket.to(receiver).emit("stop_typing", sender);
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });
});

// socket.join(userId); :- This means the socket is now inside a room named after that userId. Multiple sockets (say if the same user is logged in on mobile + laptop) can join the same room.

// emit → Send an event
//     You use it to send data to the other side (client → server OR server → client).
//     You can name the event anything ("join", "message", "typing", etc.).
//     You can also pass along data (payload).


// on → Listen for an event :-You use it to listen and react when that event is received.


// socket.emit(event, data)
//     Sends an event only back to the same socket (the current client).
//     It’s like replying to the person who just spoke.


// io.emit(event, data)
//     Sends an event to all connected sockets (broadcast to everyone).


// io.to(roomId).emit(event, data)
//     Sends an event to all sockets in a specific room.
//     Perfect for private chats or group chats.

// socket.to(roomId).emit(event, data)
//     Sends an event to everyone in the room except the sender.
//     Useful when you don’t want the sender to receive their own event.