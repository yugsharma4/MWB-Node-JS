const admin = require("firebase-admin");

const credentials = require("../key.json");

const BUCKET = "mwb-node-js.appspot.com";
admin.initializeApp({
  credential: admin.credential.cert(credentials),
  storageBucket: BUCKET,
});

const db = admin.firestore();

const User = db.collection("User");

const bucket = admin.storage().bucket();

const uploadImage = async (req, res, next) => {
  if (!req.file) return next();

  const img = req.file;
  const fileName = Date.now() + "." + img.originalname.split(".").pop();

  const file = bucket.file(fileName);

  const stream = file.createWriteStream({
    metadata: {
      contentType: img.mimetype,
    },
  });

  stream.on("error", () => {
    console.log("File uploading error...");
  });

  stream.on("finish", async () => {
    await file.makePublic();

    req.file.firebaseUrl = `https://storage.googleapis.com/${BUCKET}/${fileName}`;
    next();
  });

  stream.end(img.buffer);
};

module.exports = { User, uploadImage };
