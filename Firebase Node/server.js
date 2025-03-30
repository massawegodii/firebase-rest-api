require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const imageRoutes = require("./routes/imageRoutes");

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", imageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
