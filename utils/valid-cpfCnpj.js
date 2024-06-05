const isValidCpf = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, ""); // Remove tudo que não é dígito
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; // Elimina CPFs inválidos conhecidos

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

const isValidCnpj = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, ""); // Remove tudo que não é dígito
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false; // Elimina CNPJs inválidos conhecidos

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
};

/**
 * Small description of your action
 * @title Verificar se o CPF ou CNPJ é valido
 * @category validation
 * @author ana
 * @param {string} cpfCnpj
 */
const isValidCPFOrCNPJ = (cpfCnpj) => {
  const value = String(cpfCnpj).replace(/[^\d]+/g, "");

  if (!value) return false;
  else if (value.length === 11) {
    return isValidCpf(value) ? true : false;
  } else if (value.length === 14) {
    return isValidCnpj(value) ? true : false;
  }
};

module.exports = { isValidCPFOrCNPJ };

