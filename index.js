require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { sendMessage } = require("./whatsapp-api/api");
const { flowChatbot } = require("./chatbot-flow/chatbot");
const { getPaymentsByCPF } = require("./asaas-integration/api");

const app = express();
const port = 5000;

app.get("/pagamento", async (req, res) => {
  const resp = await getPaymentsByCPF("24971563792");
  res.send(resp);
});

app.get("/", async (req, res) => {
  res.send('Olá você');
});


app.use(bodyParser.json());

app.post("/send-message", async (req, res) => {
  console.log("request recived: /send-message", req.body);
  const { phone, message } = req.body;

  try {
    const result = await sendMessage(phone, message);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

app.post("/z-api-webhook", (req, res) => {
  const message = req.body;

  // Processar a mensagem conforme necessário
  flowChatbot(message);

  res.status(200).send("Mensagem recebida com sucesso");
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
