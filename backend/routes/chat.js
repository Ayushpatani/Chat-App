const express = require("express");
const router = express.Router();
const ChatModel = require("../models/ChatModel"); // adjust path if needed

// ROUTE 1: Create a new chat
router.post("/create", async (req, res) => {
    try {
        const { chatName, users } = req.body;

        if (!users || users.length < 2) {
            return res.status(400).json({ error: "At least 2 users required to create a chat" });
        }

        const newChat = new ChatModel({
            chatName,
            users,
        });

        const savedChat = await newChat.save();
        res.json(savedChat);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error while creating chat");
    }
});

// ROUTE 2: Get all chats (with populated users & latestMessage)
router.get("/all", async (req, res) => {
    try {
        const chats = await ChatModel.find()
            .populate("users", "name email")       // populate user details
            .populate("latestMessage");            // populate latest message
        res.json(chats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error while fetching chats");
    }
});

module.exports = router;
