const pool = require("../db");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const { sendMessage } = require("../whatsapp-api/api");
const { getFullDataPayments } = require("../asaas-integration/service");

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

  // console.log("mailOptions ", mailOptions ? "ok" : "com erro");

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
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
      message: (client, payments) => `
        Olá ${client.name}, você está recebendo sua fatura Pi Telecom com vencimento em\n${payments.dueDate}\n
        Para acessar o boleto, clique no link abaixo:\n${payments.invoiceUrl}\n
        Caso queira pagar por Pix, copie o código abaixo:\n${payments.pixCode}\n
        Caso queira pagar pelo código de barras, copie o código abaixo:\n${payments.typeableCode}\n\n
        Essa é uma mensagem automática da Pi Telecom, não é necessário responde-lá.`,
      consoleLogMessage: "a vencer em 5 dias: ",
    },
    {
      days: 0,
      isPast: false,
      emailSubject: "Sua fatura Pi Telecom vence hoje!",
      emailTemplate: "lembrete-vencimento.html",
      message: (client, payments) => `
        Olá ${client.name}, a sua fatura da Pi Telecom vence hoje e este é apenas um lembrete.\n
        Pagar sua fatura é bem simples, basta acessar o link abaixo e visualizar seu boleto.\n
        ${payments.invoiceUrl}\n
        Se você já efetuou o pagamento, por favor, desconsidere essa mensagem.\n
        Essa é uma mensagem automática da Pi Telecom, não é necessário responde-lá.`,
      consoleLogMessage: "vence hoje: ",
    },
    {
      days: 3,
      isPast: true,
      emailSubject: "Fatura em aberta",
      emailTemplate: "fatura-vencida.html",
      message: (client, payments) => `
        Olá ${client.name}, sua fatura com a Pi Telecom encontra-se em aberto há 3 dias, evite o bloqueio.\n 
        Pagar sua fatura é bem simples, basta acessar o link abaixo e visualizar seu boleto\n
        ${payments.invoiceUrl}\n\n
        Essa é uma mensagem automática da Pi Telecom, não é necessário responde-lá.`,
      consoleLogMessage: "venceu a 3 dias: ",
    },
  ];

  const processClients = async (config) => {
    const users = await searchUsersDatabase(config.days, config.isPast);

    users.rows.forEach(async (client) => {
      const payments = await getFullDataPayments(client.cpfCnpj);
      payments.username = client.name;

      console.log(config.consoleLogMessage, client.name);

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
        console.log(message);
        // await sendMessage(client.phone, message);
      }
      console.log('\n===================================\n')
    });
  };

  for (const config of notificationConfigs) {
    await processClients(config);
  }
};

module.exports = {
  sendBillingNotifications,
};
