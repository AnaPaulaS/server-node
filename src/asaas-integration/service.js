const moment = require("moment");

const logger = require("../utils/logger");

const {
  getUserByCPF,
  getPayment,
  getPaymentPixCode,
  getPaymentTypeableCode,
} = require("./api");

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
  logger.debug('Asaas - solicitação de fatura para o cpfCnpj',value)
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
    logger.error("Erro:", { message: error.message, stack: error.stack });
    throw error;
  }
};

const getFullDataPayments = async (cpfCnpj,statusPayment) => {
  const value = String(cpfCnpj).replace(/[^\d]+/g, "");
  try {
    const userId = await getUserByCPF(value);

    if (userId === "unregistered_user") {
      return null;
    }

    const payments = await getPayment(userId, statusPayment);
    if (payments === null) {
      return null;
    }

    // pegar a fatura mais recentemente criada
    const latestPendingPayment = payments.data.reduce((latest, current) => {
      return new Date(current.dateCreated) > new Date(latest.dateCreated)
        ? current
        : latest;
    });

    const pixCode = await getPaymentPixCode(latestPendingPayment.id);
    if (pixCode === null) {
      return null;
    }
    const typeableCode = await getPaymentTypeableCode(latestPendingPayment.id);
    if (typeableCode === null) {
      return null;
    }

    return {
      pixCode: pixCode.payload,
      typeableCode: typeableCode.identificationField,
      invoiceUrl: latestPendingPayment.invoiceUrl,
      dueDate: moment(latestPendingPayment.dueDate).format("DD/MM/YYYY"),
    };

  } catch (error) {
    logger.error("Erro:", { message: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = { getPaymentsByCPF, getFullDataPayments };
