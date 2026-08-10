const express = require("express");
const router = express.Router();
const Message = require("../models/messageModel");

// Get all messages between two users
router.get("/:user1/:user2", async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 },
            ],
        })
            .sort({ createdAt: 1 })
            .populate("sender", "name _id")
            .populate("receiver", "name _id");

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Send a message
router.post("/send", async (req, res) => {
    try {
        const { sender, receiver, content } = req.body;

        if (!sender || !receiver || !content)
            return res.status(400).json({ error: "sender, receiver, and content required" });

        const message = new Message({ sender, receiver, content });
        const savedMessage = await message.save();

        await savedMessage.populate("sender", "name _id");
        await savedMessage.populate("receiver", "name _id");

        res.json(savedMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
