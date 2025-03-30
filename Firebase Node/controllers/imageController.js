const { bucket } = require("../firebaseConfig");
const { v4: uuidv4 } = require("uuid");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filename = `${Date.now()}-${req.file.originalname}`;
    const blob = bucket.file(filename);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
    });

    blobStream.on("error", (err) =>
      res.status(500).json({ error: err.message })
    );

    blobStream.on("finish", async () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURIComponent(blob.name)}?alt=media&token=${
        blob.metadata.metadata.firebaseStorageDownloadTokens
      }`;

      res.status(200).json({ imageUrl: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllImages = async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    const urls = await Promise.all(
      files.map(async (file) => {
        const [metadata] = await file.getMetadata();
        const token = metadata.metadata?.firebaseStorageDownloadTokens;
        const url = `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURIComponent(file.name)}?alt=media&token=${token}`;
        return url;
      })
    );
    res.json({ images: urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
