const menssage1 =
  "Olá! 👋 Bem-vindo ao atendimento automatizado da Pi Telecom!";
const menssage2 = "Escolha uma opção abaixo";
const menssage3 = "1. Solicitar atendimento";
const menssage4 = "2. 2º via de fatura";
const menssage5 = "Digite o CPF ou CNPJ cadastrado em nosso sistema";
const menssage6 = "O CPF/CNPJ informado não é valido!";
const menssage7 = "Aguarde enquanto busco a fatura para o CPF/CNPJ {cpfCnpj}";
const menssage8 = "Não há fatura em aberto para esse CPF";
const menssage9 = "Valor a pagar:";
const menssage10 = "Vencimento:";
const menssage11 = "Link da fatura:";
const menssage12 = "Posso usar o CPF/CNPJ {cpfCnpj}, cadastrado anteriormente?";
const menssage13 = "1. Sim";
const menssage14 = "2. Não";
const menssage15 =
  "Desculpa. Você inseriu algo que não fui capaz de entender, ensira a opção {OPCAO_RESP} ou 0 para finalizar.";

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
