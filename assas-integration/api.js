const axios = require("axios");

// interface PaymentInterface {
//   customer: string;
//   dueDate: string;
//   value: string;
//   bankSlipUrl: string;
//   pixTransaction: string;
// }

const asaasApiKey =
  "$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODExMjM6OiRhYWNoXzdiOTdhMjE3LTU2YzMtNDBmMy1iZDkwLTljM2M5ZjEzOWU2Nw==";
const asaasBaseUrl = "https://sandbox.asaas.com/api/v3";

const getUserByCPF = async (cpfCnpj) => {
  // JOSE
  // "customer": "cus_000006023762",
  // "cpfCnpj": "24971563792",

  try {
    // Requisição para buscar os boletos do cliente pelo CPF
    const response = await axios.get(`${asaasBaseUrl}/customers`, {
      params: { cpfCnpj },
      headers: {
        "Content-Type": "application/json",
        access_token: asaasApiKey,
      },
    });

    // console.log('=================customer response: ', response.data.data)

    const user = response.data.data;
    // console.log('user: ', user)

    const userId = user.map((u) => u.id);
    // console.log('customer do cliente: ', userId)
    return userId;
  } catch (error) {
    console.log("Erro ao buscar o usuario:", error);
  }
};

const getPayment = async (userId) => {
  try {
    // Requisição para buscar os boletos do cliente pelo seu id

    const response = await axios.get(`${asaasBaseUrl}/payments`, {
      params: { userId },
      headers: {
        "Content-Type": "application/json",
        access_token: asaasApiKey,
      },
    });

    console.log("=======> response: ", response.data.data);

    if (response.data.data && response.data.data.length > 0) {
      const payments = response.data.data;
      // console.log('=======> payments: ', payments)

      // FILTRAR OS NAO PAGOS OU O ULTIMO NAO PAGO - VERIFICAR

      // console.log('=======> result bankSlipUrl', payments[0].bankSlipUrl)

      const value = {
        customer: payments[0].customer,
        dueDate: payments[0].dueDate,
        value: payments[0].value,
        bankSlipUrl: payments[0].bankSlipUrl,
        invoiceUrl: payments[0].invoiceUrl,
        pixTransaction: payments[0].pixTransaction,
      };
      console.log("=======> value ", value);

      return value;
    } else {
      console.log("Não foi encontrado boletos para esse CPF/CNPJ");
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
 * @param {string} value - An example string variable
 */
const getPaymentsByCPF = async (value) => {
  console.log("==== START ASAAS INTEGRACAO ======", value);
  try {
    const userId = await getUserByCPF(value);

    if (!userId) {
      throw new Error("User not found or API request failed");
    }

    console.log('userId', userId)

    const payments = await getPayment(userId);
    console.log("userPayments", payments);

    if (payments) {
      return {
        bankSlipUrl: payments.bankSlipUrl,
        dueDate: payments.dueDate,
        value: payments.value,
        invoiceUrl: payments.invoiceUrl,
      };
    }
  } catch (error) {
    console.log("Error:", error);
  }
};

// return getPaymentsByCPF(args.value)
module.exports = { getPaymentsByCPF };
