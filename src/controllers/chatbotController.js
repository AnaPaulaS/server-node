const { handleChatbotMessage } = require('../services/chatbotService');

const logger = require("../utils/logger");

exports.processChatbotMessage = (req, res, next) => {
  const message = req.body;
  logger.http("Requisição recebida para /api/z-api-webhook");

  try {
    handleChatbotMessage(message);
    res.status(200).send("Mensagem recebida com sucesso");
  } catch (error) {
    logger.error("Erro chatbotController:", { message: error.message, stack: error.stack });
    next(error);
  }
};
