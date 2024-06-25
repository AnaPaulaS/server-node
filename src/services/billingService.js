const pool = require("../db");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const { sendMessage } = require("../whatsapp-api/api");
const { getFullDataPayments } = require("../asaas-integration/service");
const AsyncQueue = require("./asyncQueue");
const logger = require("../utils/logger");

// Configure o transporte de email
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  },
});

// Função para enviar email
const sendEmail = (to, subject, templateName, templateData) => {
  // Carregar o template
  const filePath = path.join(__dirname, "..", "templates-email", templateName);
  const source = fs.readFileSync(filePath, "utf-8").toString();

  // Compilar o template com Handlebars
  const template = handlebars.compile(source);
  const htmlToSend = template(templateData);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlToSend,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error("Erro ao enviar email:", error);
    } else {
      logger.debug("Email sent:", info.response);
    }
  });
};

const sendMessageWithDelay = async (client, payments, config) => {
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay de 5 segundos

  if (client.email) {
    sendEmail(
      client.email,
      config.emailSubject,
      config.emailTemplate,
      payments
    );
  }
  if (client.phone) {
    const message = config.message(client, payments);
    // TODO: descomentar
    await sendMessage(client.phone, message);
    logger.info(message);
  }
};

/**
 * Função para buscar os usuários a partir de uma data a ser considerada
 */
const searchUsersDatabase = async (date, isPast) => {
  const currentDate = new Date();
  const targetDate = new Date();

  if (isPast) {
    targetDate.setDate(currentDate.getDate() - date);
  } else {
    targetDate.setDate(currentDate.getDate() + date);
  }

  const dayOfMonth = targetDate.getDate();

  // verificar quais sao os clientes que devem ser notificados neste dia
  const users = await pool.query(
    `
    SELECT name, cpfCnpj, phone, email 
    FROM clients 
    WHERE due_day = $1`,
    [dayOfMonth]
  );

  return users;
};

// Função para disparar faturas
const sendBillingNotifications = async () => {
  const notificationConfigs = [
    {
      days: 5,
      isPast: false,
      emailSubject: "Sua fatura Pi Telecom chegou",
      emailTemplate: "envio-fatura.html",
      statusPayment: "PENDING",
      message: (client, payments) => `
        Olá ${client.name}, você está recebendo sua fatura Pi Telecom com vencimento em\n${payments.dueDate}\n
        Para acessar o boleto, clique no link abaixo:\n${payments.invoiceUrl}\n
        Caso queira pagar por Pix, copie o código abaixo:\n${payments.pixCode}\n
        Caso queira pagar pelo código de barras, copie o código abaixo:\n${payments.typeableCode}\n\n
        Essa é uma mensagem automática da Pi Telecom, não é necessário responde-lá.`,
    },
    {
      days: 0,
      isPast: false,
      emailSubject: "Sua fatura Pi Telecom vence hoje!",
      emailTemplate: "lembrete-vencimento.html",
      statusPayment: "PENDING",
      message: (client, payments) => `
        Olá ${client.name}, a sua fatura da Pi Telecom vence hoje e este é apenas um lembrete.\n
        Pagar sua fatura é bem simples, basta acessar o link abaixo e visualizar seu boleto.\n
        ${payments.invoiceUrl}\n
        Se você já efetuou o pagamento, por favor, desconsidere essa mensagem.\n
        Essa é uma mensagem automática da Pi Telecom, não é necessário responde-lá.`,
    },
    {
      days: 3,
      isPast: true,
      emailSubject: "Fatura em aberta",
      emailTemplate: "fatura-vencida.html",
      statusPayment: "OVERDUE",
      message: (client, payments) => `
        Olá ${client.name}, sua fatura com a Pi Telecom encontra-se em aberto há 3 dias, evite o bloqueio.\n 
        Pagar sua fatura é bem simples, basta acessar o link abaixo e visualizar seu boleto\n
        ${payments.invoiceUrl}\n\n
        Essa é uma mensagem automática da Pi Telecom, não é necessário responde-lá.`,
    },
  ];

  // Cria uma fila com limite de 1 conexao por vez
  const queue = new AsyncQueue(1);

  for (const config of notificationConfigs) {
    // await processClients(config);
    const users = await searchUsersDatabase(config.days, config.isPast);

    // Enfileira cada cliente para envio de e-mail
    for (const client of users.rows) {

      const payments = await getFullDataPayments(
        client.cpfcnpj,
        config.statusPayment
      );
      // cuidado que banco padrao escrita ta diferente para cpfcnpj
      if (payments !== null) {
        payments.username = client.name;

        // Enfileira a função de envio de e-mail com atraso
        await queue.enqueue(() => sendMessageWithDelay(client, payments, config));
      }
    }
  }
  // Aguarda a conclusão de todos os envios
  await queue.run();
};

module.exports = {
  sendBillingNotifications,
};
