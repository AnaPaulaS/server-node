const logger = require("../utils/logger");

exports.hotspotUnlockUser = async (value) => {
  try {
    console.log('chamar o hotspot para desbloquear usuario')
    
    // antes dessa parte: criar uma fila de cpf que estao com pagamento em aberto???sera que precisa msg dessa etapa?
    // verificar por 'description' se é uma 'Cobrança wifi pre-pago Pi Telecom'
    // pegar o customer para obter o cpf com o request /customer
    // enviar para o hotspot a confirmacao para desbloqueio

  } catch (error) {
    logger.error("Erro hotspotUnlockUser ", {
        message: error.message,
        stack: error.stack,
      });
  }
};
