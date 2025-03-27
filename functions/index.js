const functions = require("firebase-functions");

const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const cors = require("cors");
const { response } = require("express");
const app = express();

app.use(cors({ origin: true }));
const db = admin.firestore();

// Routes
app.get("/", (req, res) => {
  return res.status(200).send("Welcome to the API");
});

// create Endpoints
// Post
app.post("/api/create", (req, res) => {
  (async () => {
    try {
      await db.collection("userdetails").doc(`/${Date.now()}/`).create({
        id: Date.now(),
        name: req.body.name,
        mobile: req.body.mobile,
        address: req.body.address,
      });

      return res.status(200).send({ status: "Success", msg: "Data Saved" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});

// // Read specific user detail
app.get("/api/get/:id", (req, res) => {
  (async () => {
    try {
      const reqDoc = db.collection("userdetails").doc(req.params.id);
      let userDetail = await reqDoc.get();
      let response = userDetail.data();

      return res.status(200).send({ status: "Success", data: response });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});

// // Read all user details
app.get("/api/get/all", async (req, res) => {
    try {
      const querySnapshot = await db.collection("userdetails").get();
  
      if (querySnapshot.empty) {
        return res.status(200).send({ status: "Success", data: [] });
      }

      const response = [];
  
      querySnapshot.forEach((doc) => {
        console.log("Document Data:", doc.data());
  
        const data = doc.data();
        response.push({
          name: data.name || null,
          mobile: data.mobile || null,
          address: data.address || null,
        });
      });
  
      res.status(200).send({ status: "Success", data: response });
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "Failed", msg: error.message });
    }
  });
  
  

 // update
app.put("/api/update/:id", (req, res) => {
  (async () => {
    try {
      const reqDoc = db.collection("userdetails").doc(req.params.id);
      await reqDoc.update({
        name: req.body.name,
        mobile: req.body.mobile,
        address: req.body.address,
      });
      return res.status(200).send({ status: "Success", msg: "Data Updated" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});

// Delete Data
app.delete("/api/delete/:id", (req, res) => {
  (async () => {
    try {
      const reqDoc = db.collection("userdetails").doc(req.params.id);
      await reqDoc.delete();
      return res.status(200).send({ status: "Success", msg: "Data Removed" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});

// Exports api to the firebase cloud functions
exports.app = functions.https.onRequest(app);