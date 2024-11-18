const NLPManager = require("../services/nlpManager");
const path = require("path");
const { Produto, BotWhats } = require("../models");
const { sendMeusPedidos } = require("../comandos/bot/licenca/msgPedidos");
const {
  sendComprarLicenca,
} = require("../comandos/bot/licenca/msgComprarLicenca");
const {
  confirmPurchase,
} = require("../comandos/bot/licenca/msgConfirmarCompra");

// Nome do modelo e idioma
const modelName = "assistenteLicenca.model.nlp";
const language = "pt";
const modelDir = path.join(__dirname, "../treinos/assistenteLicenca/");

// Instanciar o gerenciador de NLP com o caminho personalizado
const nlpManager = new NLPManager(language, modelName, modelDir);
nlpManager.loadModel(); // Carregar o modelo treinado

async function botLicenca(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg === false) {
      const response = await nlpManager.process(language, message.body);

      if (response.intent === "visualizar_pedidos") {
        await sendMeusPedidos(client, message.from);
      } else if (response.intent === "adquirir_licenca") {
        await sendComprarLicenca(client, message.from);
      } else if (response.intent === "selecionar_produto") {
        console.log("response: ", response);
        const nomeSecao = client.session;
        const dadosBot = await BotWhats.findOne({ where: { nomeSecao } });
        const idBot = dadosBot.dataValues.id;

        const produtos = await Produto.findAll({
          where: { idBot },
          include: ["licencas"],
        });

        const productNameEntity = response.entities.find(
          (entity) => entity.entity === "produto"
        );
        console.log("productNameEntity: ", productNameEntity);
        const productName = productNameEntity ? productNameEntity.option : null;

        if (productName) {
          const selectedProduct = produtos.find(
            (produto) =>
              produto.nome.toLowerCase() === productName.toLowerCase()
          );

          if (selectedProduct) {
            await confirmPurchase(client, message.from, selectedProduct);
          } else {
            await client.sendText(
              message.from,
              `Desculpa, mas não reconheço este item: ${productName}.`
            );
          }
        } else {
          console.log("Nenhum nome de produto encontrado");
          await client.sendText(
            message.from,
            "Desculpa, mas não reconheço este item."
          );
        }
      } else if (response.answer) {
        await client.sendText(message.from, response.answer);
      } else {
        await client.sendText(
          message.from,
          "Desculpe, não entendi sua mensagem. Poderia reformular?"
        );
      }
    }
  });
}

module.exports = { botLicenca };
