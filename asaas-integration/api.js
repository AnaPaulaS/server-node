const axios = require("axios");

const asaasApiKey = process.env.API_KEY_ASAAS;
const asaasBaseUrl = process.env.BASE_URL_ASAAS;

const getUserByCPF = async (cpfCnpj) => {
  // JOSE
  // "customer": "cus_000006023762",
  // "cpfCnpj": "24971563792",

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
      const payments = paymentData.data;

      const invoiceUrl = payments.map(payment => payment.invoiceUrl).join('\n')
      const valuePayment = payments.reduce((sum, payment) => sum + payment.value, 0)

      const value = {
        paymentsPending: paymentData.totalCount,
        customer: payments[0].customer,
        dueDate: paymentData.totalCount === 1? payments[0].dueDate : null,
        value: valuePayment,
        invoiceUrl: invoiceUrl,
      };

      return value;
    } else {
      return null;
    }
  } catch (error) {
    console.log("Erro ao buscar os boletos:", error);
  }
};


/**
 * Integração de solicitação de boleto a api do gateway
 * objeto fatura contera link, linha digitavel do boleto, codigo pix etc
 * @title Solicitação de boleto
 * @category ASAAS_API
 * @author ana
 * @param {string} cpfCnpj - An example string variable
 */
const getPaymentsByCPF = async (cpfCnpj) => {
  const value = String(cpfCnpj).replace(/[^\d]+/g, "");
  console.log("<<LOG: ASAAS busca fatura para: ", value);
  try {
    const userId = await getUserByCPF(value);

    if (userId === "unregistered_user") {
      return null;
    }

    const payments = await getPayment(userId, "PENDING");

    if (payments !== null) {
      return {
        paymentsPending: payments.paymentsPending,
        bankSlipUrl: payments.bankSlipUrl,
        dueDate: payments.dueDate,
        value: payments.value,
        invoiceUrl: payments.invoiceUrl,
      };
    } else return null;
  } catch (error) {
    console.log("Error:", error);
  }
};

module.exports = { getPaymentsByCPF };
