const express = require("express");
const { paymentReceived } = require("../controllers/asaaPaymentReceivedControler");
const router = express.Router();

router.post("/asaas-payment-received", paymentReceived);

module.exports = router;
