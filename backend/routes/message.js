const express = require("express");
const router = express.Router();
const Message = require("../models/messageModel");
const fetchuser = require("../middleware/fetch");

router.get("/:otherUserId", fetchuser, async (req, res) => {
  try {
    const me = req.user.id;
    const other = req.params.otherUserId;

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email pic _id")
      .populate("receiver", "name email pic _id");

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/send", fetchuser, async (req, res) => {
  try {
    const sender = req.user.id;
    const { receiver, content } = req.body;

    if (!receiver || !content?.trim()) {
      return res.status(400).json({ error: "receiver and content are required" });
    }

    const message = await Message.create({
      sender,
      receiver,
      content: content.trim(),
    });

    await message.populate("sender", "name email pic _id");
    await message.populate("receiver", "name email pic _id");

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/seen/:otherUserId", fetchuser, async (req, res) => {
  try {
    const me = req.user.id;
    const other = req.params.otherUserId;
    const now = new Date();

    await Message.updateMany(
      { sender: other, receiver: me, seen: false },
      { $set: { seen: true, seenAt: now } }
    );

    res.json({ success: true, seenAt: now });
  } catch (error) {
    console.error("Mark seen error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
