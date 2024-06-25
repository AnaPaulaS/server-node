const logger = require("../utils/logger");
const { hotspotUnlockUser } = require("../services/hotspotService");

exports.paymentReceived = (req, res, next) => {
  logger.http("Requisição recebida para /api/asaas-payment-received");

  try {
    const message = req.body;
    hotspotUnlockUser(message);

    res.status(200).send("Mensagem recebida com sucesso");
  } catch (error) {
    logger.error("Erro assas webhook:", {
      message: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
