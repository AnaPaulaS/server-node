const { sendMessageService } = require("../services/messageService");
const logger = require("../utils/logger");

exports.sendMessage = async (req, res, next) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    const errorMessage = 'Os campos "phone" e "message" são obrigatórios';
    logger.error(errorMessage);
    return res.status(400).json({ error: errorMessage });
  }

  try {
    const result = await sendMessageService(phone, message);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
