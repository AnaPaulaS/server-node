require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { sendMessage } = require("./whatsapp-api/api");
const { flowChatbot } = require("./chatbot-flow/chatbot");

const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(bodyParser.json());


app.post("/send-message", async (req, res) => {
  console.log("request recived: /send-message",req.body);
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
  flowChatbot(message)

  res.status(200).send("Mensagem recebida com sucesso");
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});


