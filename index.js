require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { sendMessage } = require("./whatsapp-api/api");

const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(bodyParser.json());

app.post("/send-message", async (req, res) => {
  console.log("request recived: /send-message");
  const { phone, message } = req.body;

  try {
    const result = await sendMessage(phone, message);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
