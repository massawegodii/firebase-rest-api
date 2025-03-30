require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const imageRoutes = require("./routes/imageRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", imageRoutes);

app.use("/api/messages", messageRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
