const { sendMessage } = require('../whatsapp-api/api');

exports.sendMessageService = async (phone, message) => {
  return await sendMessage(phone, message);
};