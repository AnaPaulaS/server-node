const flowChatbot = (message) => {
    console.log(
      `Mensagem recebida de ${message.senderName}: ${message.text.message}`
    );
}

module.exports = { flowChatbot };