require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/message', require('./routes/message'));

const startServer = async () => {
  await connectToMongo();

  const server = app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });

  const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
      origin: clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const onlineUsers = new Map();

  const broadcastPresence = () => {
    io.emit('online_users', Array.from(onlineUsers.keys()));
  };

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      if (!userId) return;
      socket.data.userId = String(userId);
      socket.join(String(userId));
      onlineUsers.set(String(userId), (onlineUsers.get(String(userId)) || 0) + 1);
      broadcastPresence();
    });

    socket.on('send_message', (msg) => {
      if (!msg?.receiver) return;
      io.to(String(msg.receiver)).emit('receive_message', msg);
    });

    socket.on('typing', ({ sender, receiver }) => {
      if (sender && receiver) io.to(String(receiver)).emit('typing', String(sender));
    });

    socket.on('stop_typing', ({ sender, receiver }) => {
      if (sender && receiver) io.to(String(receiver)).emit('stop_typing', String(sender));
    });

    socket.on('messages_seen', ({ by, withUser }) => {
      if (by && withUser) io.to(String(withUser)).emit('messages_seen', { by: String(by) });
    });

    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      if (!userId) return;
      const remaining = (onlineUsers.get(userId) || 1) - 1;
      if (remaining <= 0) onlineUsers.delete(userId);
      else onlineUsers.set(userId, remaining);
      broadcastPresence();
    });
  });
};

startServer();
