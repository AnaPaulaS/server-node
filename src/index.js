require("dotenv").config();
const express = require("express");
const cron = require('node-cron');
const bodyParser = require("body-parser");

const logger = require("./utils/logger");
const messageRoutes = require("./routes/messageRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const { sendBillingNotifications } = require('./services/billingService');

const app = express();
const port = 5000;
app.use(bodyParser.json());

app.use("/api", messageRoutes);
app.use("/api", chatbotRoutes);

// Agendar a tarefa para rodar todos os dias às 8h da manhã
cron.schedule('0 8 * * *', () => {
  console.log('Rodando envio de email as 8hrs');
  sendBillingNotifications();
});

// Middleware para capturar erros globais
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Capturar exceções não tratadas e rejeições de Promises
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason.message || reason}`, { promise });
});
