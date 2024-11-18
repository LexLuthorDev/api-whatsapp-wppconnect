const { sendWelcomeMessage } = require("../comandos/bot/licenca/msgBoasVindas");
const { sendMeusPedidos } = require("../comandos/bot/licenca/msgPedidos");
const {
  sendComprarLicenca,
} = require("../comandos/bot/licenca/msgComprarLicenca");
async function botLicenca(client) {
  client.onMessage(async (message) => {
    if (
      message.body === "Menu" ||
      (message.body === "menu" && message.isGroupMsg === false)
    ) {
      //console.log(message.sender.pushname); // Aqui você acessa o pushname do remetente
      await sendWelcomeMessage(client, message.from, message.sender.pushname);
    } else if (message.body == "1" && message.isGroupMsg === false) {
      await sendMeusPedidos(client, message.from);
    } else if (message.body == "2" && message.isGroupMsg === false) {
      await sendComprarLicenca(client, message.from);
    } else {
      console.log("Mensagem inválida:", message.body);
      ///await sendWelcomeMessage(client, message.from, message.sender.pushname);
    }
  });
}
async function botLicenca(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg === false) {
      console.log("mensagem bot licença: ", message.body);
    }
  });
}

module.exports = { botLicenca };
