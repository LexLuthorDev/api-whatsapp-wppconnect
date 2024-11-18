require("dotenv").config();

const {
  MercadoPagoConfig,
  Payment,
  IdentificationType,
} = require("mercadopago");

async function realizarPagamento(
  total,
  descricao,
  nomeCliente,
  emailCliente,
  cpfCliente
) {
  const client = new MercadoPagoConfig({
    accessToken: process.env.TOKEN_MP_PRODUCAO,
  });

  const payment = new Payment(client);

  const body = {
    transaction_amount: total,
    description: descricao,
    payment_method_id: "pix",
    payer: {
      email: emailCliente,
      first_name: nomeCliente,
      identification: {
        type: "CPF",
        number: cpfCliente,
      },
    },
    //notification_url:
    //"https://0735-2804-1530-104-8-7c7a-69c3-b578-9cf4.ngrok-free.app/webhook/mercado-pago-pix",
  };

  return payment
    .create({ body })
    .then((response) => {
      const transactionData = response.point_of_interaction.transaction_data;
      const qrCodeBase64 = transactionData.qr_code_base64;
      const qrCode = transactionData.qr_code;
      const ticketUrl = transactionData.ticket_url;
      const idPedidoMp = response.id;

      return { qrCodeBase64, qrCode, ticketUrl, idPedidoMp };
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

module.exports = { realizarPagamento };
