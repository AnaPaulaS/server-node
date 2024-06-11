const { handleChatbotMessage } = require('../services/chatbotService');

exports.processChatbotMessage = (req, res, next) => {
  const message = req.body;

  try {
    handleChatbotMessage(message);
    res.status(200).send("Mensagem recebida com sucesso");
  } catch (error) {
    next(error);
  }
};
