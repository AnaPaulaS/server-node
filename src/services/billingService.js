const pool = require("../db");
const nodemailer = require("nodemailer");
const { sendMessage } = require("../whatsapp-api/api");

// Configure o transporte de email
const transporter = nodemailer.createTransport({
  //   service: "gmail",
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true, // Rejeita conexões não autorizadas
    minVersion: "TLSv1.2", // Versão mínima do TLS
  },
});

// Função para enviar email
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Função para enviar mensagem no WhatsApp
const sendWhatsAppMessage = async (to, message) => {
  //   await sendMessage(to, message);
  console.log("enviar msg por wpp", to, message);
};

// Função para disparar faturas
const sendBillingNotifications = async () => {
  const currentDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(currentDate.getDate() + 5);
  const formattedDate = dueDate.toISOString().split("T")[0];

  // verificar quais sao os clientes que devem ser notificados
  const res = await pool.query(
    `
    SELECT name, cpfCnpj, phone, email 
    FROM clients 
    WHERE due_date = $1`,
    [formattedDate]
  );

  // TODO: buscar no asaas as faturas de cada cliente

  res.rows.forEach((client) => {
    const message = `Olá ${client.name}, sua fatura vence em 5 dias. Por favor, verifique seu email para mais detalhes.`;
    if (client.email) {
      console.log("client", client);
      sendEmail(client.email, "Lembrete de Fatura", message);
    }
    sendWhatsAppMessage(client.phone, message);
  });
};

module.exports = {
  sendBillingNotifications,
};
