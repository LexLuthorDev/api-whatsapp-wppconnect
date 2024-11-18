const { MercadoPagoConfig, Payment } = require("mercadopago");

async function realizarPagamentoCartaoCredito(
  total,
  descricao,
  nomeCliente,
  emailCliente,
  cpfCliente,
  tokenCartao,
  parcelas,
  metodoPagamentoId,
  emissorId
) {
  const client = new MercadoPagoConfig({
    accessToken:
      "APP_USR-4308262881835950-013113-f5850adc90e5cb739ad08593abc9acf8-168312649",
  });

  const payment = new Payment(client);

  const body = {
    transaction_amount: total,
    token: tokenCartao,
    description: descricao,
    installments: parcelas,
    payment_method_id: metodoPagamentoId,
    issuer_id: emissorId,
    payer: {
      email: emailCliente,
      first_name: nomeCliente,
      identification: {
        type: "CPF",
        number: cpfCliente,
      },
    },
  };

  return payment
    .create({ body })
    .then((response) => {
      const status = response.status;
      const statusDetail = response.status_detail;
      const idPedidoMp = response.id;

      return { status, statusDetail, idPedidoMp };
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

module.exports = { realizarPagamentoCartaoCredito };
