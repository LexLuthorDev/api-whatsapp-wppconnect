// emailService.js

const nodemailer = require("nodemailer");

async function enviarEmail(remetente, destinatario, assunto, conteudoHTML) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "posseidon1989@gmail.com",
        pass: "vtqrqjcvwdsucbsa",
      },
    });

    const emailEnviado = await transporter.sendMail({
      from: remetente,
      to: destinatario,
      subject: assunto,
      html: conteudoHTML,
    });

    return emailEnviado;
  } catch (error) {
    throw error;
  }
}

module.exports = { enviarEmail };
