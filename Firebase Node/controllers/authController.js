const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { admin } = require("../firebaseConfig");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

// Register user
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }

    const userExists = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (!userExists.empty) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRecord = await admin.auth().createUser({ email, password });

    await db.collection("users").doc(userRecord.uid).set({
      email,
      passwordHash: hashedPassword,
    });

    res.status(201).json({ uid: userRecord.uid, email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordMatch = await bcrypt.compare(
      password,
      userData.passwordHash
    );
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { uid: userDoc.id, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
};
