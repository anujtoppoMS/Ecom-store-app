const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController");

router.post("/register", registerController.handleRegister); // Ensure function reference is correct

module.exports = router;