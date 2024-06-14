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

  //   console.log("mailOptions ", mailOptions ? "ok" : "com erro");

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Função para disparar faturas
const sendBillingNotifications = async () => {
  const currentDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(currentDate.getDate() + 5);
  const formattedDate = dueDate.toISOString().split("T")[0];

  // verificar quais sao os clientes que devem ser notificados neste dia
  const res = await pool.query(
    `
    SELECT name, cpfCnpj, phone, email 
    FROM clients 
    WHERE due_date = $1`,
    [formattedDate]
  );

  res.rows.forEach(async (client) => {
    // Busca no asaas os dados para pagamento a serem enviados por email
    const payments = await getFullDataPayments(client.cpfCnpj);
    payments.username = client.name;

    // if (client.email) {
    //   sendEmail(
    //     client.email,
    //     "Sua fatura Pi Telecom chegou",
    //     "envio-fatura.html",
    //     payments
    //   );
    // }
    if (client.phone) {
      const message = `
        Olá ${client.name}, você está recebendo sua fatura Pi Telecom com vencimento em\n${payments.dueDate}\n
        Para acessar o boleto, clique no link abaixo:\n${payments.invoiceUrl}\n
        Caso queira pagar por Pix, copie o código abaixo:\n${payments.pixCode}\n
        Caso queira pagar pelo código de barras, copie o código abaixo:\n${payments.typeableCode}`;
      

      const messagePart1 = `
        Olá ${client.name}, você está recebendo sua fatura Pi Telecom com vencimento em\n${payments.dueDate}\n
        Para acessar o boleto, clique no link abaixo:\n${payments.invoiceUrl}\nCaso queira pagar por Pix, copie o código abaixo:`;
      const messagePart2 = payments.pixCode;
      const messagePart3 =
        "Caso queira pagar pelo código de barras, copie o código abaixo:";
      const messagePart4 = payments.typeableCode;

      // TODO: mandar tudo em 1 mensagem ou mandar picado pra facilitar a copia dos codigos?

      //   await sendMessage(client.phone, message);

      console.log(message);
    }
  });
};

module.exports = {
  sendBillingNotifications,
};
