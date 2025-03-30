const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "<your-project-id>.appspot.com", // ✅ Replace with your actual project ID
});

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const bucket = admin.storage().bucket();

module.exports = {
  admin,
  db,
  bucket,
};
