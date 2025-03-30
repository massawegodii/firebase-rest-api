const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { uploadImage, getAllImages } = require("../controllers/imageController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/upload", verifyToken, upload.single("image"), uploadImage);
router.get("/images", verifyToken, getAllImages);

module.exports = router;
