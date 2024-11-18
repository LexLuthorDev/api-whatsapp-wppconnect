const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const {
  BotWhats,
  Comprador,
  ProdutosDelivery,
  PedidosBotDelivery,
  sequelize,
} = require("../models");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function generateBotResponse(userMessage, client, message) {
  const nomeSecao = client.session;
  const dadosBot = await BotWhats.findOne({ where: { nomeSecao } });
  const idBot = dadosBot.dataValues.id;
  const clienteNome = message.sender.pushname;

  // Lista de produtos
  const produtos = await ProdutosDelivery.findAll({
    where: { idBot, status: 2 },
  });
  let menuMessage = `📋 *Cardápio*\n\n`;

  produtos.forEach((produto) => {
    const precoFloat = parseFloat(produto.preco);
    menuMessage += `${produto.id}. ${produto.emoticon} ${
      produto.nome
    } - R$ ${precoFloat.toFixed(2)}\n`;
  });

  const opcoesMenu = [
    "Fazer um pedido",
    "Verificar status do pedido",
    "Ver cardápio",
  ];

  const pedidos = await PedidosBotDelivery.findAll({
    where: { numWhats: message.from },
  });

  const pedidosText = pedidos.length
    ? pedidos
        .map(
          (pedido) =>
            `ID: ${pedido.id}, Status: ${pedido.status}, Total: R$ ${pedido.preco}`
        )
        .join("\n")
    : "Você não tem pedidos no momento.";

  let prompt;

  if (userMessage.toLowerCase().includes("status")) {
    prompt = `
O cliente deseja verificar o status do pedido.
Nome do cliente: ${clienteNome}
Pedidos: ${pedidosText}`;
  } else if (
    userMessage.toLowerCase().includes("cardápio") ||
    userMessage.toLowerCase().includes("cardapio")
  ) {
    prompt = `
O cliente deseja ver o cardápio.
Nome do cliente: ${clienteNome}
Cardápio: ${menuMessage}`;
  } else if (userMessage.toLowerCase().includes("fazer um pedido")) {
    prompt = `
O cliente deseja fazer um pedido.
Nome do cliente: ${clienteNome}
Pergunte qual item do cardápio ele deseja adicionar ao carrinho.`;
  } else {
    // Se a mensagem do usuário contiver um número, tentamos adicionar o item ao carrinho
    const itemId = parseInt(userMessage.trim());
    if (!isNaN(itemId)) {
      const produto = produtos.find((p) => p.id === itemId);
      if (produto) {
        await PedidosBotDelivery.create({
          numWhats: message.from,
          idBot: idBot,
          produto: produto.nome,
          preco: produto.preco,
          status: 0, // status 0 para itens no carrinho
        });
        prompt = `
O cliente adicionou o item ${produto.nome} ao carrinho.
Pergunte se deseja adicionar mais algum item ou finalizar o pedido.`;
      } else {
        prompt = `
Número do item inválido.
Cardápio: ${menuMessage}`;
      }
    } else {
      prompt = `
O cliente enviou uma mensagem.
Nome do cliente: ${clienteNome}
Opções do menu: ${opcoesMenu.join(", ")}`;
    }
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();

  return text;
}
// Função para configurar e iniciar o bot
async function botDelivery(client) {
  // Função de tratamento de mensagens
  client.onMessage(async (message) => {
    if (message.body && message.isGroupMsg === false) {
      const userMessage = message.body;
      const botResponse = await generateBotResponse(
        userMessage,
        client,
        message
      );
      client.sendText(message.from, botResponse);
    }
  });
}

module.exports = { botDelivery };
