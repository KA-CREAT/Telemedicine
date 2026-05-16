const express = require("express");
const router = express.Router();

const { startConsultation } = require("../controllers/consultationController"); // ⚠️ Problem is likely here

router.post("/start", startConsultation); // 🚫 This crashes if startConsultation is undefined

module.exports = router;
