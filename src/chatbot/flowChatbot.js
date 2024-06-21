const { sendMessage } = require("../whatsapp-api/api");
const { isValidCPFOrCNPJ } = require("../utils/valid-cpfCnpj");
const { getPaymentsByCPF } = require("../asaas-integration/service");

const moment = require("moment");
const logger = require("../utils/logger");

// Simples armazenamento de estados na memória (em produção, use um banco de dados)
let conversationStates = {};

// Definir um tempo de expiração (em milissegundos)
const EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutos

const flowChatbot = async (message) => {
  logger.debug(`Asaas - Mensagem recebida de ${message.senderName}: ${message.text.message}`)

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

        // TODO: descomentar quando integrar com z-api
        // await sendMessage(phone, responseMessage);

        const payments = await getPaymentsByCPF(bodyMessage);
        
        if (payments === null) {
          responseMessage = "Não há fatura em aberto para esse CPF/CNPJ";
        } else {
          const resp = [];
          if (payments.paymentsPending > 1) {
            resp.push(
              `Você possui ${payments.paymentsPending} faturas em aberto.\nAqui esta um resumo`
            );
          }
          resp.push(`Valor à pagar: ${payments.value}`);
          if (payments.paymentsPending === 1) {
            resp.push(
              `Vencimento: ${moment(payments.dueDate).format("DD/MM/YYYY")}`
            );
          }
          resp.push(
            `${
              payments.paymentsPending === 1
                ? "Link da fatura:"
                : "Links das faturas:"
            } ${payments.invoiceUrl}`
          );

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

  // TODO: descomentar quando integrar com z-api
  //   const response = await sendMessage(phone, responseMessage);
  logger.info("mensagem enviada para cliente:\n", responseMessage)
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

/** ETAPAS:
 * [QUANDO] receber a primeira mensagem e enviar a mensagem inicial:
 *    Olá! 👋 Bem-vindo ao atendimento automatizado da Pi Telecom!
 *    Escolha uma opção abaixo
 *    1. Solicitar atendimento
 *    2. 2º via de fatura
 * [se digitado 1]
 *
 * [se digitado 2 E nao ha historico desse numero salvo]
 *      Digite o CPF ou CNPJ cadastrado em nosso sistema
 *      <usuario envia msg>
 *      [chamar validador de cpf]
 *      [se cpf invalido]
 *      O CPF/CNPJ informado não é valido!
 *      [se cpf valido, entao enviar pra asaas]
 *      Aguarde enquanto busco a fatura para o CPF/CNPJ 123123123
 *      [se nao houver fatura em aberto]
 *      Não há fatura em aberto para esse CPF
 *      [se houver fatura]
 *      Valor a pagar: 100
 *      Vencimento: 2024-06-10
 *      Link da fatura: https://sandbox.asaas.com/i/x98hrydw2u69z78o
 *
 * [se digitado 2 E HÁ historico desse numero salvo]
 *      Posso usar o CPF/CNPJ 12756922650, cadastrado anteriormente?
 *      1. Sim
 *      2. Não
 *      <usuario envia msg>
 *      [se digitado 1 segue abaixo]
 *          Aguarde enquanto busco a fatura para o CPF/CNPJ 123123123
 *          [se nao houver fatura em aberto]
 *          Não há fatura em aberto para esse CPF
 *          [se houver fatura]
 *          Valor a pagar: 100
 *          Vencimento: 2024-06-10
 *          Link da fatura: https://sandbox.asaas.com/i/x98hrydw2u69z78o
 *      [se digitado 2 faz fluxo principal]
 *        ........
 *      [se digitado OUTRA OPÇÃO]
 *          Desculpa. Você inseriu algo que não fui capaz de entender, ensira a opção [X ou Y] ou 0 para finalizar.
 * [se digitado OUTRA OPÇÃO]
 *      Desculpa. Você inseriu algo que não fui capaz de entender, ensira a opção [X ou Y] ou 0 para finalizar.
 */
