const { getUserByCPF } = require("./api");
const { getPayment } = require("./api");

/**
 * Serviço de solicitação de boleto a api do gateway
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
      const invoiceUrl = payments.data
        .map((payment) => payment.invoiceUrl)
        .join("\n");

      const valuePayment = payments.data.reduce(
        (sum, payment) => sum + payment.value,
        0
      );

      return {
        paymentsPending: payments.totalCount,
        customer: payments.data[0].customer,
        dueDate: payments.totalCount === 1 ? payments.data[0].dueDate : null,
        value: valuePayment,
        invoiceUrl: invoiceUrl, // alterar esse formato que usa \n nao ta bom
      };
    } else return null;
  } catch (error) {
    console.log("Error:", error);
  }
};

module.exports = { getPaymentsByCPF };
