const { flowChatbot } = require('../chatbot/flowChatbot');

exports.handleChatbotMessage = (message) => {
  flowChatbot(message);
};
