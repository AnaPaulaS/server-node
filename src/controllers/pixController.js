const { logger } = require("../utils/logger");
const { isValidCpf } = require("../utils/valid-cpfCnpj");
const { pixPaymentService } = require("../services/pixCodeService");
// const hotspotService = require('../services/hotspotService');

exports.generatePix = async (req, res) => {
  try {
    const { cpfCnpj, mobilePhone, name } = req.body;

    // TODO: cpfCnpj e mobilePhone sao obrigatorios

    if (!isValidCpf(cpfCnpj)) {
      return res.status(400).json({ message: "Erro: CPF inválido" });
    }

    const generetePixCode = await pixPaymentService(cpfCnpj, mobilePhone, name);
    res.json(generetePixCode);
  } catch (error) {
    logger.error("Erro ao gerar cobrança");
    res.status(500).json({ error: error.message });
  }
};

// exports.notifyPayment = async (req, res) => {
//   try {
//     const { paymentId, userId } = req.body;
//     const isPaid = await bankService.verifyPayment(paymentId);

//     if (isPaid) {
//     //   await hotspotService.unlockUser(userId);
//     //   criar o desbloqueio no hotspot para esse usuario
//       res.json({ message: 'User unlocked' });
//     } else {
//       res.status(400).json({ message: 'Payment not verified' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
