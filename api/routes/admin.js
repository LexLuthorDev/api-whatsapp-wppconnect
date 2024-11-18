
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Rota: POST /login
router.post("/login", adminController.login);

module.exports = router;
