const axios = require("axios");

const URL = process.env.URL_Z_API;

const sendMessage = async (phone, message) => {
  try {
    console.log("Log: envio mensagem para o numero", phone);
    const response = await axios.post(`${URL}/send-text`, {
      phone: phone,
      message: message
    }, {
      headers: {
        'Client-Token': process.env.CLIENT_TOKEN_Z_API,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw error;
  }
};

module.exports = { sendMessage };
