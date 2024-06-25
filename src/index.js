require("dotenv").config();
const express = require("express");
const cron = require('node-cron');
const bodyParser = require("body-parser");

const logger = require("./utils/logger");
const messageRoutes = require("./routes/messageRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const asaasWebhook = require("./routes/asaasWebhook");
const pixRoutes = require('./routes/pixRoutes');
// const userRoutes = require('./routes/userRoutes');
const { sendBillingNotifications } = require('./services/billingService');

const app = express();
const port = 5000;
app.use(bodyParser.json());

app.use("/api", messageRoutes);
app.use("/api", chatbotRoutes);
app.use("/api", asaasWebhook);

app.use('/pix', pixRoutes);
// app.use('/user', userRoutes);

// Agendar a tarefa para rodar todos os dias às 7h da manhã
cron.schedule('0 10 * * *', () => {
  logger.info('Servidor rodando envio de email as 7hrs')
  sendBillingNotifications();
});

app.listen(port, () => {
  logger.info(`Servidor rodando em http://localhost:${port}`);
});

// Middleware para capturar erros globais
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Capturar exceções não tratadas e rejeições de Promises
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason.message || reason}`, { promise });
});
