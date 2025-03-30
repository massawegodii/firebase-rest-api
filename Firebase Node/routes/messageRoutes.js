const express = require("express");
const router = express.Router();
const { sendMessage, getConversation, getChatList } = require("../controllers/messageController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/send", verifyToken, sendMessage);

router.get("/conversation/:userId", verifyToken, getConversation);

router.get("/chats", verifyToken, getChatList);

module.exports = router;
