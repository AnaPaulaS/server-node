const {
  generatePixPayment,
  getUserByCPF,
  getPaymentPixCode,
  createCustomer,
} = require("../asaas-integration/api");

exports.pixPaymentService = async (cpfCnpj, mobilePhone, name) => {
  // buscar o usuario pegar o customer, se nao houver vai cria-lo

  console.log("cpfCnpj", cpfCnpj);
  const customer = await getUserByCPF(cpfCnpj);
  if (customer === "unregistered_user") {
    const user = await createCustomer(cpfCnpj, mobilePhone, name);
    const getPixCode = await pixCode(user.id);
    return getPixCode;
  } else {
    const getPixCode = await pixCode(customer);
    return getPixCode;
  }
};

const pixCode = async (customer) => {
  const pixCode = await generatePixPayment(customer);
  const getPixCode = await getPaymentPixCode(pixCode.id);
  return getPixCode;
};
