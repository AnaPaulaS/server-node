const axios = require("axios");
const logger = require("../utils/logger");

const asaasApiKey = process.env.API_KEY_ASAAS;
const asaasBaseUrl = process.env.BASE_URL_ASAAS;

const getUserByCPF = async (cpfCnpj) => {
  logger.http(`Requisição enviada para ${asaasBaseUrl}/customers`)
  try {
    const response = await axios.get(`${asaasBaseUrl}/customers`, {
      params: { cpfCnpj },
      headers: {
        "Content-Type": "application/json",
        access_token: asaasApiKey,
      },
    });

    if (response.data.totalCount === 0) {
      return "unregistered_user";
    } else {
      // asaas permite ter mais de 1 cadastro para o mesmo CPF, estou pegando o primeiro
      return response.data.data[0].id;
    }
  } catch (error) {
    logger.error("Erro ao buscar o usuário:", { message: error.message, stack: error.stack });
    throw error;
  }
};

const getPayment = async (customer, status) => {
  logger.http(`Requisição enviada para ${asaasBaseUrl}/payments`)
  try {
    // Requisição para buscar os boletos do cliente pelo seu id

    const response = await axios.get(`${asaasBaseUrl}/payments`, {
      params: { customer, status },
      headers: {
        "Content-Type": "application/json",
        access_token: asaasApiKey,
      },
    });

    const paymentData = response.data;

    if (paymentData.data && paymentData.data.length > 0) {
      return paymentData;
    } else {
      return null;
    }
  } catch (error) {
    logger.error("Erro ao buscar os boletos:", { message: error.message, stack: error.stack });
    throw error;
  }
};

const getPaymentTypeableCode = async (payId) => {
  logger.http(`Requisição enviada para ${asaasBaseUrl}/payments/${payId}/identificationField`)
  try {
    const response = await axios.get(
      `${asaasBaseUrl}/payments/${payId}/identificationField`,
      {
        headers: {
          "Content-Type": "application/json",
          access_token: asaasApiKey,
        },
      }
    );

    const paymentData = response.data;

    if (paymentData) {
      return paymentData;
    } else {
      return null;
    }
  } catch (error) {
    logger.error("Erro ao buscar o codigo de barras:", { message: error.message, stack: error.stack });
    throw error;
  }
};

const getPaymentPixCode = async (payId) => {
  logger.http(`Requisição enviada para ${asaasBaseUrl}/payments/${payId}/pixQrCode`)
  try {
    const response = await axios.get(
      `${asaasBaseUrl}/payments/${payId}/pixQrCode`,
      {
        headers: {
          "Content-Type": "application/json",
          access_token: asaasApiKey,
        },
      }
    );

    const paymentData = response.data;
    
    if (paymentData) {
      return paymentData;
    } else {
      return null;
    }
  } catch (error) {
    logger.error("Erro ao buscar o codigo pix:", { message: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = {
  getUserByCPF,
  getPayment,
  getPaymentTypeableCode,
  getPaymentPixCode,
};
