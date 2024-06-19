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

    console.log("mailOptions ", mailOptions ? "ok" : "com erro");

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
const searchUsersDatabase = async (date, comparison) => {
  const currentDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(currentDate.getDate() + date);
  const formattedDate = dueDate.toISOString().split("T")[0];

  // verificar quais sao os clientes que devem ser notificados neste dia
  const users = await pool.query(
    `
    SELECT name, cpfCnpj, phone, email 
    FROM clients 
    WHERE due_date ${comparison} $1`,
    [formattedDate]
  );

  return users;
};

// Função para disparar faturas
const sendBillingNotifications = async () => {
  // Quando a fatura for gerada e deve ser enviada por email e/ou whatsapp para o clinte
  const usersInvoiceGenerated = await searchUsersDatabase(5, "=");

  usersInvoiceGenerated.rows.forEach(async (client) => {
    // Busca no asaas os dados para pagamento a serem enviados por email
    const payments = await getFullDataPayments(client.cpfCnpj);
    payments.username = client.name;

    if (client.email) {
      // sendEmail(
      //   client.email,
      //   "Sua fatura Pi Telecom chegou",
      //   "envio-fatura.html",
      //   payments
      // );
    }
    if (client.phone) {
      const message = `
        Olá ${client.name}, você está recebendo sua fatura Pi Telecom com vencimento em\n${payments.dueDate}\n
        Para acessar o boleto, clique no link abaixo:\n${payments.invoiceUrl}\n
        Caso queira pagar por Pix, copie o código abaixo:\n${payments.pixCode}\n
        Caso queira pagar pelo código de barras, copie o código abaixo:\n${payments.typeableCode}\n\n
        Essa é uma mensagem automática da Pi Telecom, não é necessário responde-lá.`;

      // console.log(message);
      // await sendMessage(client.phone, message);
    }
  });

  // Quando a fatura ainda nao foi paga e o vencimento é para a data atual
  const usersInvoiceDue = await searchUsersDatabase(0, "=");
  usersInvoiceDue.rows.forEach(async (client) => {    
    const payments = await getFullDataPayments(client.cpfCnpj);    
    payments.username = client.name;

    if (client.email) {
      console.log("vai receber email de lembrete:", client.name);
      sendEmail(
        client.email,
        "Sua fatura Pi Telecom vence hoje!",
        "lembrete-vencimento.html",
        payments
      );
    }
    if (client.phone) {
      const message = `
      Olá ${client.name}, a sua fatura da Pi Telecom vence hoje e este é apenas um lembrete.\n
      Se você já efetuou o pagamento, por favor, desconsidere essa mensagem.\n
      Pagar sua fatura é bem simples, basta acessar o link abaixo e visualizar seu boleto.\n
      ${payments.invoiceUrl}\n\n
      Essa é uma mensagem automática da Pi Telecom, não é necessário responde-lá.`;

      console.log(message);
      // await sendMessage(client.phone, message);
    }
  });

  // Quando a fatura ainda nao foi paga e o vencimento já passou alguns dias
  const usersOverdueInvoice = await searchUsersDatabase(0, "<");
  // aqui há problema no tempo, preciso pegar usuario com 3 dias de vencimento

  usersOverdueInvoice.rows.forEach(async (client) => {    
    if (client.phone) {
      const message = `
      Olá ${client.name}, sua fatura com a Pi Telecom encontra-se em aberto há [x_dias] dias, evite o bloqueio.\n 
      Pagar sua fatura é bem simples, basta acessar o link abaixo e visualizar seu boleto\n
      ${payments.invoiceUrl}\n\n
      Essa é uma mensagem automática da Pi Telecom, não é necessário responde-lá.`;

      console.log(message);
      // await sendMessage(client.phone, message);
    }
  });
};

module.exports = {
  sendBillingNotifications,
};
