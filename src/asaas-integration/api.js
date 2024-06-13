const axios = require("axios");

const asaasApiKey = process.env.API_KEY_ASAAS;
const asaasBaseUrl = process.env.BASE_URL_ASAAS;

const getUserByCPF = async (cpfCnpj) => {
  try {
    // buscar os dados do cliente pelo CPF
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
    console.log("Erro ao buscar o usuario:", error);
  }
};

const getPayment = async (userId, status) => {
  try {
    // Requisição para buscar os boletos do cliente pelo seu id
    
    const response = await axios.get(`${asaasBaseUrl}/payments`, {
      params: { userId, status },
      headers: {
        "Content-Type": "application/json",
        access_token: asaasApiKey,
      },
    });

    const paymentData = response.data;

    if (paymentData.data && paymentData.data.length > 0) {
      return paymentData
    } else {
      return null;
    }
  } catch (error) {
    console.log("Erro ao buscar os boletos:", error);
  }
};

module.exports = { getUserByCPF, getPayment };