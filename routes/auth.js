const express = require("express");
const router = express.Router();
const { signup, signin } = require("../controllers/auth");

//SignUp
router.post("/signup", signup);

//SignIn
router.post("/signin", signin);

module.exports = router;
