const {
  BotWhats,
  Comprador,
  ProdutosDelivery,
  PedidosBotDelivery,
  sequelize,
} = require("../models");
const paymentController = require("../controllers/paymentController");
const { getIoInstance } = require("../bin/sockets"); // Importa a instância do Socket.IO
// Objeto para armazenar as instâncias dos bots
let clients = {};
let carts = {}; // Objeto para armazenar os carrinhos de compras dos usuários
let isUserInCardapio = false;
async function botDelivery(client) {
  client.onMessage(async (message) => {
    if (
      message.body === "menu" &&
      message.isGroupMsg === false &&
      isUserInCardapio === false
    ) {
      await sendWelcomeMessage(client, message.from, message.sender.pushname);
    } else if (
      message.body === "1" &&
      message.isGroupMsg === false &&
      isUserInCardapio === false
    ) {
      await sendCardapio(client, message.from);
    } else if (
      message.body === "2" &&
      message.isGroupMsg === false &&
      isUserInCardapio === false
    ) {
      await sendMeusPedidos(client, message.from);
    } /*else if (message.body === "3" && message.isGroupMsg === false) {
      await sendComprarLicenca(client, message.from);
    }*/ else if (
      message.body === "3" &&
      message.isGroupMsg === false &&
      isUserInCardapio === false
    ) {
      await falarAtendente(client, message.from);
    } else if (
      message.body.startsWith("4") &&
      message.isGroupMsg === false &&
      isUserInCardapio === false
    ) {
      const bodyWithoutPrefix = message.body.slice(1); // Remove o prefixo "4"

      // Verifica se o usuário enviou apenas "4" ou se o restante da mensagem é vazio
      if (bodyWithoutPrefix.trim() === "") {
        await client.sendText(
          message.from,
          "❌ Opcão inválida. Por favor, envie 4️⃣ seguido do ID do item."
        );
        await sendWelcomeMessage(client, message.from, message.sender.pushname);
      } else {
        const index = parseInt(bodyWithoutPrefix);

        if (isNaN(index)) {
          await client.sendText(
            message.from,
            "❌ Opcão inválida. Por favor, tente novamente envie 4️⃣ seguido do id do item."
          );
          await sendWelcomeMessage(
            client,
            message.from,
            message.sender.pushname
          );
        } else {
          await removeItemFromCart(client, message.from, index);
        }
      } //
    } else if (
      message.body === "5" &&
      message.isGroupMsg === false &&
      isUserInCardapio === false
    ) {
      await esvaziarFromCart(client, message.from);
    } else if (
      message.body === "6" &&
      message.isGroupMsg === false &&
      isUserInCardapio === false
    ) {
      await showCart(client, message.from);
    }
  });
}
async function sendWelcomeMessage(client, from, pushname) {
  isUserInCardapio = false;
  try {
    const dadosBot = await BotWhats.findOne({
      where: { nomeSecao: client.session },
    });
    const transaction = await sequelize.transaction();
    const idBot = dadosBot.dataValues.id;
    const numWhats = from;
    const comprador = await Comprador.findOne(
      {
        where: { numWhats },
      },
      { transaction }
    );

    if (!comprador) {
      await client.sendText(
        from,
        `Olá ${pushname} , estamos cadastrando o seu telefone ⏳⏳⏳`
      );

      await Comprador.create(
        {
          numWhats,
          idBot,
        },
        { transaction }
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const welcomeMessage = `👋 Olá ${pushname}, bem-vindo ao nosso serviço de delivery! 🍔🥤\n\nEscolha uma opção do menu:\n\n1️⃣ - *Ver Cardápio* 📋 \n\n2️⃣ - *Ver Pedidos* 🛍  \n\n3️⃣ - *Falar com Atendente* 💬  \n\n4️⃣ - *Remover Item do Carrinho* - digite 4 e o [número do item]\n\n5️⃣ - *Esvaziar Carrinho* 🧹\n\n6️⃣ -  Para visualizar o carrinho  🛒`;
      await client.sendText(from, welcomeMessage);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const welcomeMessage = `👋 *Bem-vindo novamente ${pushname}* \n\nEscolha uma opção do menu:\n\n1️⃣ - *Ver Cardápio* 📋 \n\n2️⃣ - *Ver Pedidos* 🛍  \n\n3️⃣ - *Falar com Atendente* 💬  \n\n4️⃣ - *Remover Item do Carrinho* - digite 4 e o [número do item]\n\n5️⃣ - *Esvaziar Carrinho* 🧹\n\n6️⃣ -  Para visualizar o carrinho  🛒`;
      await client.sendText(from, welcomeMessage);
    }

    await transaction.commit();
  } catch (error) {
    console.error("Erro ao enviar mensagens: ", error);
  }
}

async function falarAtendente(client, from) {
  await client.sendText(from, "Falta implementar esta função ainda");
}

async function sendMeusPedidos(client, from) {
  console.log("sendMeusPedidos");
  const pedidos = await PedidosBotDelivery.findAll({
    where: { numWhats: from },
  });

  //console.log("Pedidos:", pedidos);

  if (pedidos.length === 0 || pedidos === null) {
    const noPedidosMessage = `❌ *Você não tem pedidos registrados.*`;
    client
      .sendText(from, noPedidosMessage)
      .then((result) => {
        // console.log("No pedidos message sent: ", result); // retorno de sucesso
      })
      .catch((erro) => {
        console.error("Erro ao enviar mensagem de pedidos: ", erro); // retorno de erro
      });
  } else {
    let pedidosMessage = `📦 *Você escolheu "Meus Pedidos".*\n\n`;

    pedidos.forEach((pedido, index) => {
      const precoFloat = parseFloat(pedido.dataValues.preco);
      const dataCompra = new Date(pedido.dataValues.createdAt);
      const dia = ("0" + dataCompra.getDate()).slice(-2);
      const mes = ("0" + (dataCompra.getMonth() + 1)).slice(-2);
      const ano = dataCompra.getFullYear();
      const horas = ("0" + dataCompra.getHours()).slice(-2);
      const minutos = ("0" + dataCompra.getMinutes()).slice(-2);
      const dataFormatada = `${dia}/${mes}/${ano} ${horas}:${minutos}`;
      const status = pedido.dataValues.status === 2 ? "Concluído" : "Pendente";
      const iconStatus = pedido.dataValues.status === 2 ? "✅" : "❌";

      pedidosMessage += `-----------------------------------------------------\n`;

      pedidosMessage += `Pedido ${index + 1}:\n`;
      pedidosMessage += `Preço: R$ ${pedido.dataValues.preco}\n`;
      pedidosMessage += `Itens:\n`;

      // Parse the JSON string of items
      const itens = JSON.parse(pedido.dataValues.itens);
      itens.forEach((item) => {
        pedidosMessage += `- ${item.quantity} x ${item.emoticon} ${item.nome} - R$ ${item.preco}\n`;
      });

      pedidosMessage += `\n`;
      pedidosMessage += `🗓 *Data da Compra:* ${dataFormatada}\n`;
      pedidosMessage += `💵 *Valor Total:* R$ ${precoFloat.toFixed(2)}\n`;
      pedidosMessage += `${iconStatus} ${status}\n`;
    });

    client
      .sendText(from, pedidosMessage)
      .then((result) => {
        // console.log("Meus Pedidos message sent: ", result); // retorno de sucesso
      })
      .catch((erro) => {
        console.error("Erro ao enviar mensagem de Meus Pedidos: ", erro); // retorno de erro
      });
  }
}

async function quantityListener(client, from, selectedProduct) {
  const onMessageHandler = async (quantityMessage) => {
    if (
      quantityMessage.isGroupMsg === false &&
      quantityMessage.from === from &&
      !isNaN(quantityMessage.body)
    ) {
      const quantity = parseInt(quantityMessage.body);

      await addItemToCart(client, from, selectedProduct, quantity);
      client.listenerEmitter.removeListener("onMessage", onMessageHandler);
      // Perguntar se o usuário quer adicionar mais itens ou finalizar a compra
      await client.sendText(
        from,
        `Você gostaria de adicionar mais itens ao carrinho? Responda com *1️⃣* para continuar ou *2️⃣* para ver seu 🛒.`
      );
      //isUserInCardapio = false;
      await continueOrFinishListener(client, from);
    } else {
      //await sendInvalidOption(client, from);
      client.listenerEmitter.removeListener("onMessage", onMessageHandler);
    }
  };

  client.listenerEmitter.on("onMessage", onMessageHandler);
}

async function continueOrFinishListener(client, from) {
  const onMessageHandler = async (message) => {
    if (message.isGroupMsg === false && message.from === from) {
      const response = message.body.toLowerCase();

      if (response === "1") {
        await sendCardapio(client, from);
      } else if (response === "2") {
        await showCart(client, from);
      } else {
        await client.sendText(
          from,
          `Por favor, digite 1️⃣ para continuar ou 2️⃣ para ver seu 🛒.`
        );
        isUserInCardapio = false;
        await showCart(client, from);
      }

      client.listenerEmitter.removeListener("onMessage", onMessageHandler);
    }
  };

  client.listenerEmitter.on("onMessage", onMessageHandler);
}

async function sendCardapio(client, from) {
  isUserInCardapio = true;
  console.log("isUserInCardapio dento do sendCardapio", isUserInCardapio);
  const nomeSecao = client.session;
  const dadosBot = await BotWhats.findOne({ where: { nomeSecao } });
  const idBot = dadosBot.dataValues.id;

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

  menuMessage += `\nDigite o número do item que deseja pedir.`;

  await client.sendText(from, menuMessage);

  const onMessageHandler = async (message) => {
    if (
      message.isGroupMsg === false &&
      !isNaN(message.body) &&
      message.from === from
    ) {
      const productId = parseInt(message.body);

      const selectedProduct = produtos.find(
        (produto) => produto.id === productId
      );

      if (selectedProduct) {
        await client.sendText(
          from,
          `Quantas unidades de ${selectedProduct.nome} você gostaria de adicionar ao carrinho?`
        );
        await quantityListener(client, from, selectedProduct);
        client.listenerEmitter.removeListener("onMessage", onMessageHandler);
      } else {
        await client.sendText(from, `Escolha um item válido.`);
        //client.listenerEmitter.removeListener("onMessage", onMessageHandler);
      }
    } else {
      await sendInvalidOption(client, from);
      client.listenerEmitter.removeListener("onMessage", onMessageHandler);
    }
  };

  client.listenerEmitter.on("onMessage", onMessageHandler);
}

async function addItemToCart(client, from, produto, quantity) {
  let unidadeString = quantity > 1 ? "unidades" : "unidade";

  if (!carts[from]) {
    carts[from] = [];
  }

  // Verificar se o item já está no carrinho
  const existingItemIndex = carts[from].findIndex(
    (item) => item.id === produto.dataValues.id
  );

  if (existingItemIndex !== -1) {
    // Se o item já está no carrinho, aumentar a quantidade
    carts[from][existingItemIndex].quantity += quantity;
  } else {
    // Se o item não está no carrinho, adicioná-lo
    carts[from].push({ ...produto.dataValues, quantity });
  }

  await client.sendText(
    from,
    `✅ ${quantity} ${unidadeString} de ${produto.nome} adicionada(o) ao carrinho.`
  );
}

async function showCart(client, from) {
  isUserInCardapio = true;
  const nomeSecao = client.session;
  const dadosBot = await BotWhats.findOne({ where: { nomeSecao } });
  const valorFrete = parseFloat(dadosBot.dataValues.valorFrete);

  const cart = carts[from];
  if (!cart || cart.length === 0) {
    await client.sendText(from, `🛒 Seu carrinho está vazio.`);
    isUserInCardapio = false;
    return;
  }

  let cartMessage = `🛒 *Seu Carrinho:*\n\n`;
  let total = 0;
  let unidadeString = cart[0].quantity > 1 ? "unidades" : "unidade";
  cart.forEach((item, index) => {
    const precoFloat = parseFloat(item.preco);
    const itemTotal = precoFloat * item.quantity;
    cartMessage += `${index + 1}. ${item.emoticon} ${item.nome} - ${
      item.quantity
    } ${unidadeString} - R$ ${itemTotal.toFixed(2)}\n`;
    total += itemTotal;
  });

  total += valorFrete;

  /*cartMessage += `\n💵 *Total dos Itens:* R$ ${(total - valorFrete).toFixed(
    2
  )}\n`;*/
  cartMessage += `🏍 *Valor do Frete:* R$ ${valorFrete.toFixed(2)}\n`;
  cartMessage += `💵 *Valor Total:* R$ ${total.toFixed(2)}\n`;
  cartMessage += `\ndigite *1️⃣* Para finalizar a compra, ou digite *2️⃣* para voltar para o menu.`;

  await client.sendText(from, cartMessage);

  const onMessageHandler = async (message) => {
    isUserInCardapio = true;
    if (message.isGroupMsg === false && message.from === from) {
      const response = message.body.toLowerCase();

      if (response === "1") {
        console.log("a resposta foi 1");
        isUserInCardapio = false;
        await finalizePurchase(client, from);
      } else if (response === "2") {
        //console.log("Voltando para o menu iscardapio...", isUserInCardapio);
        await sendWelcomeMessage(client, from, message.sender.pushname);
      }

      client.listenerEmitter.removeListener("onMessage", onMessageHandler);
    }
  };

  client.listenerEmitter.on("onMessage", onMessageHandler);
}

async function requestDeliveryAddress(client, from) {
  console.log(
    "isUserInCardapio dentro do requestDeliveryAddress",
    isUserInCardapio
  );
  await client.sendText(from, `Digite seu endereço de entrega:`);

  const onMessageHandler = async (message) => {
    if (message.isGroupMsg === false && message.from === from) {
      const deliveryAddress = message.body.trim();

      // Salvar o endereço de entrega no usuário, no banco de dados, etc.
      // Exemplo simplificado: salvar na variável carts
      if (carts[from]) {
        carts[from].deliveryAddress = deliveryAddress;
      } else {
        carts[from] = { deliveryAddress };
      }

      await client.sendText(
        from,
        `Endereço de entrega registrado com sucesso, aguarde estamos gerando seu  pagamento ...`
      );
      client.listenerEmitter.removeListener("onMessage", onMessageHandler);

      await finalizePurchase(client, from, onMessageHandler); // Mostrar o carrinho novamente após registrar o endereço
    }
  };

  client.listenerEmitter.on("onMessage", onMessageHandler);
}
async function finalizePurchase(client, from, onMessageHandler) {
  isUserInCardapio = true;
  //console.log("isUserInCardapio dentro do finalizePurchase", isUserInCardapio);
  const cart = carts[from];
  const ultimoPedido = await PedidosBotDelivery.findOne({
    where: { numWhats: from },
    order: [["id", "desc"]],
  });

  let enderecoEntrega = "";

  // Verifique se existe um ultimoPedido antes de acessar enderecoEntrega
  if (ultimoPedido) {
    enderecoEntrega = ultimoPedido.enderecoEntrega || "";
  }

  if (!cart || cart.length === 0) {
    await client.sendText(from, `🛒 Seu carrinho está vazio.`);
    return;
  }

  if (!enderecoEntrega || enderecoEntrega === "") {
    await client.sendText(
      from,
      `Por favor, registre seu endereço de entrega antes de finalizar a compra.`
    );
    await requestDeliveryAddress(client, from, onMessageHandler);
    return;
  } else {
    await client.sendText(
      from,
      `O endereço do seu ultimo pedido foi\n\n📍*${enderecoEntrega}* \n\nVocê gostaria de usar esse endereço para esta entrega?\n1️⃣ para usar o endereço atual\n2️⃣ para adicionar um novo endereço.`
    );

    const addressSelectionHandler = async (message) => {
      if (message.isGroupMsg === false && message.from === from) {
        if (message.body === "1") {
          await client.sendText(
            from,
            `Por favor, informe se tem alguma observação para o pedido (ex: sem cebola, bem passado, etc). Se não houver, responda com "Não".`
          );
          const observationHandler = async (message) => {
            if (message.isGroupMsg === false && message.from === from) {
              const observacao = message.body.trim();
              await client.sendText(
                from,
                `Aguarde, estamos gerando seu pagamento ...`
              );
              await processPurchase(
                client,
                from,
                enderecoEntrega,
                cart,
                observacao,
                onMessageHandler,
                addressSelectionHandler,
                observationHandler
              );
              // Remover o listener após processar a resposta
              await client.listenerEmitter.removeListener(
                "onMessage",
                observationHandler
              );
            }
          };
          client.listenerEmitter.on("onMessage", observationHandler);
        } else if (message.body === "2") {
          await client.sendText(from, `Digite seu endereço de entrega:`);

          const newAddressHandler = async (message) => {
            if (message.isGroupMsg === false && message.from === from) {
              isUserInCardapio = false;
              enderecoEntrega = message.body.trim();
              await client.sendText(
                from,
                `Endereço de entrega registrado com sucesso, aguarde estamos gerando seu pagamento ...`
              );
              await processPurchase(
                client,
                from,
                enderecoEntrega,
                cart,
                onMessageHandler,
                newAddressHandler
              );
              // Remover o listener após processar a resposta
              await client.listenerEmitter.removeListener(
                "onMessage",
                newAddressHandler
              );
            }
          };
          //console.log("isUserInCardapio newAddressHandler", isUserInCardapio);
          isUserInCardapio = false;

          client.listenerEmitter.on("onMessage", newAddressHandler);
        }
      }
      // Remover o listener após processar a seleção de endereço
      await client.listenerEmitter.removeListener(
        "onMessage",
        addressSelectionHandler
      );
    };

    client.listenerEmitter.on("onMessage", addressSelectionHandler);
  }
}

async function processPurchase(
  client,
  from,
  enderecoEntrega,
  cart,
  observacao,
  onMessageHandler,
  handler,
  observationHandler
) {
  let total = 0;
  cart.forEach((item) => {
    const precoFloat = parseFloat(item.preco);
    const itemTotal = precoFloat * item.quantity;
    total += itemTotal;
  });

  total = parseFloat(total);
  const descricaoPagamento = `Compra de produtos no valor de R$ ${total.toFixed(
    2
  )}`;
  const dadosBot = await BotWhats.findOne({
    where: { nomeSecao: client.session },
  });
  const tokenMpProducao = dadosBot.tokenMpProducao;

  const paymentPreference = await paymentController.createPaymentPreference(
    total,
    descricaoPagamento,
    tokenMpProducao
  );

  const numWhats = from;
  const comprador = await Comprador.findOne({ where: { numWhats } });
  const transaction = await sequelize.transaction();
  const idBot = dadosBot.dataValues.id;

  if (!comprador) {
    await Comprador.create({ numWhats, idBot }, { transaction });
  }

  const valorFrete = parseFloat(dadosBot.dataValues.valorFrete);

  await PedidosBotDelivery.create(
    {
      numWhats,
      preco: total,
      itens: cart,
      idBot,
      idTransacao: paymentPreference.idPedidoMp,
      ticketUrl: paymentPreference.ticketUrl,
      status: 1,
      enderecoEntrega,
      valorFrete,
      observacao,
    },
    { transaction }
  );

  await transaction.commit();

  // Emitir o evento de novo pedido
  const io = getIoInstance();
  io.emit("novoPedido", { pedido: cart, total, endereco: enderecoEntrega });

  let pedidoMessage = `🎉 *Compra confirmada!*\n\n`;
  pedidoMessage += `🛒 *Itens do seu pedido:*\n\n`;
  cart.forEach((item) => {
    const totalTransacao = item.preco * item.quantity;
    pedidoMessage += `${item.quantity} x ${item.emoticon} ${
      item.nome
    } - R$ ${totalTransacao.toFixed(2)}\n`;
  });
  pedidoMessage += `\n💵 *Total:* R$ ${total.toFixed(2)}\n`;
  pedidoMessage += `📍 *Endereço de Entrega:* ${enderecoEntrega}\n\n`;
  pedidoMessage += `🔗 *Link para pagamento:* ${paymentPreference.ticketUrl}\n\n`;
  pedidoMessage += `👍 *Obrigado por comprar conosco!*`;

  await client.sendText(from, pedidoMessage);

  // Limpar o carrinho após finalizar a compra
  carts[from] = [];
  isUserInCardapio = false;
  // Remover os listeners após finalizar a compra
  await client.listenerEmitter.removeListener("onMessage", observationHandler);
  await client.listenerEmitter.removeListener("onMessage", handler);
  await client.listenerEmitter.removeListener("onMessage", onMessageHandler); // Ensure the original handler is also removed
}

async function removeItemFromCart(client, from, index) {
  const cart = carts[from];
  if (!cart || cart.length === 0) {
    await client.sendText(from, `🛒 Seu carrinho está vazio.`);
    return;
  }

  if (index < 1 || index > cart.length) {
    await client.sendText(
      from,
      `⚠️ Opção inválida. Por favor, insira um número válido.`
    );
    return;
  }

  const removedItem = cart.splice(index - 1, 1);
  await client.sendText(
    from,
    `❌ ${removedItem[0].nome} foi removido do seu carrinho.`
  );
}

async function esvaziarFromCart(client, from, index) {
  const cart = carts[from];
  if (!cart || cart.length === 0) {
    await client.sendText(from, `🛒 Seu carrinho está vazio.`);
    return;
  }
  // esvaziar o carrinho por completo
  carts[from] = [];
  await client.sendText(from, `🛒 Seu carrinho foi esvaziado.`);
}

async function sendInvalidOption(client, from) {
  const invalidMessage = `⚠️ *Opção inválida.*\n\nPor favor, Escolha uma opção do menu:\n\n1️⃣ - *Ver Cardápio* 📋 \n\n2️⃣ - *Ver Pedidos* 🛍  \n\n3️⃣ - *Falar com Atendente* 💬  \n\n4️⃣ - *Remover Item do Carrinho* - digite 4 e o [número do item]\n\n5️⃣ - *Esvaziar Carrinho* 🧹\n\n6️⃣ -  Para visualizar o carrinho  🛒`;
  await client.sendText(from, invalidMessage);
}

async function botDelivery(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg === false) {
      console.log("mensagem bot delivery: ", message.body);
    }
  });
}

module.exports = { botDelivery };
