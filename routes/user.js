const express = require("express");
const router = express.Router();
const { getUser, updateUser, getAllUsers } = require("../controllers/user");

const multer = require("multer");
const { uploadImage } = require("../store/config");
const { verifyToken } = require("../verificationToken");

// //Setting up a multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });

//Get user
router.get("/get", getUser);

//Update user
router.put(
  "/update",
  verifyToken,
  upload.single("file"),
  uploadImage,
  updateUser
);

//Get All Users
router.get("/getUsers", getAllUsers);

module.exports = router;
