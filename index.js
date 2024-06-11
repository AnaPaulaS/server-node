require("dotenv").config();
const express = require("express");
const winston = require("winston");
const bodyParser = require("body-parser");
const { sendMessage } = require("./whatsapp-api/api");
const { flowChatbot } = require("./chatbot-flow/chatbot");
const { getPaymentsByCPF } = require("./asaas-integration/api");

const app = express();
const port = 5000;
app.use(bodyParser.json());

// Configurar winston para logging
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Middleware para capturar erros globais
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.get("/pagamento", async (req, res) => {
  const resp = await getPaymentsByCPF("24971563792");
  res.send(resp);
});

app.get("/", async (req, res) => {
  res.send("Olá você aqui esta seu deploy");
});

app.post("/send-message", async (req, res) => {
  console.log("request recived: /send-message", req.body);
  const { phone, message } = req.body;

  if (!phone || !message) {
    const errorMessage = 'Campos "phone" e "message" são obrigatórios';
    logger.error(errorMessage);
    return res.status(400).json({ error: errorMessage });
  }

  try {
    console.log('phone', phone, 'message',message)
    const result = await sendMessage(phone, message);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Erro ao enviar mensagem: ${error.message}`);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
    next(error);
  }
});

app.post("/z-api-webhook", (req, res) => {
  const message = req.body;
  try {
    // Processar a mensagem conforme necessário
    flowChatbot(message);

    res.status(200).send("Mensagem recebida com sucesso");
  } catch (error) {
    logger.error(`Erro no webhook: ${error.message}`);
    res.status(500).json({ error: "Erro ao processar mensagem" });
    next(error);
  }
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
