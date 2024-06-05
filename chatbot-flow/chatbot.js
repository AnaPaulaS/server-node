const { sendMessage } = require("../whatsapp-api/api");
const { isValidCPFOrCNPJ } = require("../utils/valid-cpfCnpj");
const { getPaymentsByCPF } = require("../asaas-integration/api");

const moment = require('moment')

// Simples armazenamento de estados na memória (em produção, use um banco de dados)
let conversationStates = {};

// Definir um tempo de expiração (em milissegundos)
const EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutos

const flowChatbot = async (message) => {
  console.log(
    `<< LOG: Mensagem recebida de ${message.senderName}: ${message.text.message} >>`
  );

  const phone = message.phone;
  const bodyMessage = message.text.message;
  const messageId = message.phone; // sera nossa chave da conversa

  let currentState = getConversationState(messageId);

  if (!currentState) {
    // Inicia nova conversa
    updateConversationState(messageId, "initial");
    currentState = "initial";
  }
  let responseMessage = "";

  switch (currentState) {
    case "initial":
      responseMessage =
        "Olá! 👋 Bem-vindo ao atendimento automatizado da Pi Telecom!\n \nEscolha uma opção:\n \n1. Solicitar atendimento\n2. 2º via de fatura";
      updateConversationState(messageId, "awaiting_option");
      break;
    case "awaiting_option":
      if (bodyMessage === "1") {
        responseMessage =
          "Você escolheu solicitar atendimento. Como podemos ajudar?";
        updateConversationState(messageId, "awaiting_issue_description");
      } else if (bodyMessage === "2") {
        responseMessage =
          "Por favor, digite seu CPF ou CNPJ para buscar a 2º via de fatura.";
        updateConversationState(messageId, "awaiting_cpf_cnpj");
      } else {
        responseMessage =
          "Opção inválida. Escolha uma opção:\n \n1. Solicitar atendimento\n2. 2º via de fatura";
      }
      break;
    case "awaiting_issue_description":
      responseMessage =
        "Obrigado por descrever seu problema. Um atendente entrará em contato em breve.";
      updateConversationState(messageId, "initial");
      break;
    case "awaiting_cpf_cnpj":
      if (isValidCPFOrCNPJ(bodyMessage)) {
        // Suponha que você tenha uma função para validar CPF/CNPJ
        responseMessage = `Buscando fatura para o CPF/CNPJ ${bodyMessage}...`;

        await sendMessage(phone, responseMessage);

        // buscar a fatura no assas

        const payments = await getPaymentsByCPF(bodyMessage);
        console.log('<<LOG: há pagamento em aberto? >>', payments=== null? 'nao': 'sim')

        if (payments === null) {
          responseMessage = "Não há fatura em aberto para esse CPF/CNPJ";
        } else {
          const resp = [
            `Valor a pagar: ${payments.value}`,
            `Vencimento: ${moment(payments.dueDate).format('DD/MM/YYYY')}`,
            `Link da fatura: ${payments.invoiceUrl}`,
          ];
          responseMessage = resp.join("\n");
        }

        updateConversationState(messageId, "initial");
      } else {
        responseMessage = "CPF/CNPJ inválido. Por favor, digite novamente:";
      }
      break;
    default:
      responseMessage =
        "Desculpe, não entendi. Escolha uma opção:\n1. Solicitar atendimento\n2. 2º via de fatura";
      updateConversationState(messageId, "initial");
      break;
  }

  const response = await sendMessage(phone, responseMessage);
  console.log("----- response FINAL", response);
};

// Função para obter o estado atual de uma conversa
const getConversationState = (messageId) => {
  const conversation = conversationStates[messageId];

  if (conversation) {
    // Verifica se a conversa expirou
    const now = new Date().getTime();
    if (now - conversation.lastInteraction > EXPIRATION_TIME) {
      delete conversationStates[messageId];
      return null;
    }
    
    return conversation.state;
  }
  return null;
};

// Função para atualizar o estado de uma conversa
const updateConversationState = (messageId, state) => {
  conversationStates[messageId] = {
    state,
    lastInteraction: new Date().getTime(),
  };
};

module.exports = { flowChatbot };
