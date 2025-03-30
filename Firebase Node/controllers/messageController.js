const { db } = require("../firebaseConfig");

// Send a message
exports.sendMessage = async (req, res) => {
  const { to, content } = req.body;
  const from = req.user.uid;

  if (!to || !content) {
    return res.status(400).json({ error: "Receiver and message content required." });
  }

  try {
    const newMessage = {
      from,
      to,
      content,
      timestamp: Date.now(),
    };

    await db.collection("messages").add(newMessage);

    res.status(201).json({ message: "Message sent successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message." });
  }
};

// Get all messages between two users
exports.getConversation = async (req, res) => {
  const user1 = req.user.uid;
  const user2 = req.params.userId;

  try {
    const messagesRef = db.collection("messages");
    const sentQuery = messagesRef.where("from", "==", user1).where("to", "==", user2);
    const receivedQuery = messagesRef.where("from", "==", user2).where("to", "==", user1);

    const [sentSnap, receivedSnap] = await Promise.all([sentQuery.get(), receivedQuery.get()]);

    let messages = [];
    sentSnap.forEach(doc => messages.push(doc.data()));
    receivedSnap.forEach(doc => messages.push(doc.data()));

    // Sort by timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);

    res.json({ conversation: messages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};

// Get chat list (unique users you've chatted with)
exports.getChatList = async (req, res) => {
  const currentUser = req.user.uid;

  try {
    const snapshot = await db.collection("messages")
      .where("from", "==", currentUser)
      .get();

    const chatUsers = new Set();
    snapshot.forEach(doc => {
      chatUsers.add(doc.data().to);
    });

    res.json({ chatList: Array.from(chatUsers) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat list." });
  }
};
