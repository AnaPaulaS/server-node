const express = require("express");
const { sendMessage } = require("../controllers/messageController");
const router = express.Router();
const { getPaymentsByCPF } = require("../asaas-integration/service");
const { sendBillingNotifications } = require("../services/billingService");

router.post("/send-message", sendMessage);

const logger = require("../utils/logger");

// remover
router.get("/pagamento", async (req, res) => {
  logger.http("Requisição recebida para /api/pagamento");
  const resp = await getPaymentsByCPF("24971563792");
  res.send(resp);
});

router.get("/", async (req, res) => {
  logger.http("Requisição recebida para /api/");
  res.send("Olá você, aqui esta seu deploy");
});

router.get("/email", async (req, res) => {
  logger.http("Requisição recebida para /api/email");
  try {
    sendBillingNotifications();
    res.send("email enviado?");
  } catch (error) {
    logger.error("Erro ao dispar mensagens");
    res.status(500).json({ error: "Erro ao dispar mensagens" });
  }
});

module.exports = router;
