const express = require("express");
const { sendMessage } = require("../controllers/messageController");
const router = express.Router();
const { getPaymentsByCPF } = require("../asaas-integration/service");

router.post("/send-message", sendMessage);

// remover
router.get("/pagamento", async (req, res) => {
  const resp = await getPaymentsByCPF("24971563792");
  res.send(resp);
});

router.get("/", async (req, res) => {
  res.send("Olá você, aqui esta seu deploy");
});

module.exports = router;
