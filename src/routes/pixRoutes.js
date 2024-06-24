const express = require("express");
const router = express.Router();
const { generatePix } = require("../controllers/pixController");

router.post("/generate", generatePix);
// router.post('/notify', notifyPayment);

module.exports = router;
