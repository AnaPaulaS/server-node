const express = require("express");
const { processChatbotMessage } = require("../controllers/chatbotController");
const router = express.Router();

router.post("/z-api-webhook", processChatbotMessage);

module.exports = router;
