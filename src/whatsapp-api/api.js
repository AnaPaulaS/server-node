const axios = require("axios");
const logger = require("../utils/logger");

const URL = process.env.URL_Z_API;

const sendMessage = async (phone, message) => {
  logger.http(`Requisição enviada para ${URL}/send-text e telefone ${phone}`)
  try {
    const response = await axios.post(
      `${URL}/send-text`,
      {
        phone: phone,
        message: message,
      },
      {
        headers: {
          "Client-Token": process.env.CLIENT_TOKEN_Z_API,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    logger.error("Erro ao enviar mensagem:", { message: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = { sendMessage };
