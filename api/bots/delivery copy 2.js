const { NlpManager } = require("node-nlp");
const fs = require("fs");
const path = require("path");

// Função para registrar interações não reconhecidas
function logUnrecognizedInteraction(userMessage) {
  const log = { userMessage, timestamp: new Date() };
  fs.readFile(unrecognizedLogPath, (err, data) => {
    let logs = [];
    if (!err) {
      logs = JSON.parse(data);
    }
    logs.push(log);
    fs.writeFile(unrecognizedLogPath, JSON.stringify(logs, null, 2), (err) => {
      if (err)
        console.error("Erro ao registrar interação não reconhecida:", err);
    });
  });
}

// Configurar o NLP.js
const manager = new NlpManager({ languages: ["pt"], forceNER: true });
// Caminho para o arquivo de log de interações não reconhecidas
const unrecognizedLogPath = path.join(
  __dirname,
  "unrecognized_interactions.json"
);

// Adicionar intenções e documentos
const trainingData = [
  {
    intent: "saudacao",
    examples: [
      "oi",
      "olá",
      "bom dia",
      "boa tarde",
      "boa noite",
      "e aí",
      "oi, tudo bem?",
      "olá, como vai?",
    ],
  },
  {
    intent: "informacoes_estabelecimento",
    examples: [
      "qual é o endereço?",
      "onde vocês estão localizados?",
      "qual é o horário de atendimento?",
      "quando vocês abrem?",
      "qual é o valor da entrega?",
      "quanto custa a entrega?",
    ],
  },
  {
    intent: "cardapio",
    examples: [
      "quais são os sanduíches disponíveis?",
      "o que tem no cardápio?",
      "me fale sobre as bebidas",
      "quais sobremesas vocês têm?",
    ],
  },
  {
    intent: "processo_pedido",
    examples: [
      "quero fazer um pedido",
      "como faço um pedido?",
      "gostaria de pedir um X-Burger",
      "como confirmar o meu pedido?",
      "qual é o tempo de entrega?",
      "posso pagar com cartão?",
    ],
  },
  {
    intent: "status_pedido",
    examples: [
      "qual é o status do meu pedido?",
      "meu pedido já está a caminho?",
      "quando meu pedido vai chegar?",
    ],
  },
  {
    intent: "resolucao_problemas",
    examples: [
      "houve um problema com meu pedido",
      "não recebi meu pedido",
      "meu pedido está atrasado",
    ],
  },
  {
    intent: "perguntas_frequentes",
    examples: [
      "quais são as formas de pagamento?",
      "qual é o horário de funcionamento?",
    ],
  },
  {
    intent: "despedida",
    examples: ["obrigado", "tchau", "até mais"],
  },
  {
    intent: "feedback_avaliacoes",
    examples: ["como posso deixar um feedback?", "onde eu avalio o serviço?"],
  },
  {
    intent: "promocoes_fidelidade",
    examples: [
      "quais são as promoções?",
      "como funciona o programa de fidelidade?",
    ],
  },
  {
    intent: "informacoes_nutricionais",
    examples: [
      "quais são os ingredientes?",
      "quais são as restrições alimentares?",
    ],
  },
  {
    intent: "politica_devolucao",
    examples: ["qual é a política de devolução?", "como funciona o reembolso?"],
  },
  {
    intent: "contatos_emergencia",
    examples: [
      "qual é o número de emergência?",
      "como entro em contato em caso de problema?",
    ],
  },
];

const responses = {
  saudacao: [
    "Olá! Bem-vindo ao nosso serviço de delivery. Como posso ajudá-lo hoje?",
  ],
  informacoes_estabelecimento: [
    "Endereço: Rua Exemplo, 123, Bairro de Exemplos, Cidade Exemplo, CEP 00000-000",
    "Horário de Atendimento: Segunda a Domingo: das 11h às 23h",
    "Valor da Entrega: R$ 5,00 para pedidos até 5 km; R$ 10,00 para pedidos entre 5 e 10 km; Acima de 10 km, consulte nossos atendentes.",
    "Localização no Mapa: [Link do Google Maps](https://maps.google.com)",
  ],
  cardapio: [
    "Sanduíches: X-Burger: R$ 12,00, X-Salada: R$ 15,00, X-Bacon: R$ 18,00",
    "Bebidas: Refrigerante: R$ 5,00, Suco Natural: R$ 7,00",
    "Sobremesas: Brownie: R$ 10,00, Sorvete: R$ 8,00",
  ],
  processo_pedido: [
    "Para fazer um pedido, diga o que você gostaria de pedir.",
    "Confirme o pedido detalhando os itens e preços.",
    "Solicite o endereço de entrega.",
    "Pergunte se há alguma instrução especial para a entrega.",
    "Informe o tempo estimado de entrega (aproximadamente 30 a 45 minutos).",
    "Pergunte ao cliente se ele deseja pagar com dinheiro ou cartão na entrega.",
    "Você pode acompanhar seu pedido em tempo real através deste link: [Link de Acompanhamento].",
  ],
  status_pedido: [
    "Seu pedido está sendo preparado e será enviado em breve.",
    "Seu pedido já está a caminho e deve chegar em aproximadamente [tempo estimado].",
  ],
  resolucao_problemas: [
    "Desculpe pelo inconveniente. Vou verificar o que aconteceu com o seu pedido. Pode me informar o número do pedido, por favor?",
    "Estamos resolvendo o problema e seu pedido será entregue o mais rápido possível. Agradecemos pela paciência.",
  ],
  perguntas_frequentes: [
    "Nosso horário de funcionamento é de segunda a domingo, das 11h às 23h.",
    "Aceitamos dinheiro, cartão de crédito e débito na entrega.",
  ],
  despedida: [
    "Obrigado por escolher nosso serviço de delivery. Tenha um ótimo dia!",
  ],
  feedback_avaliacoes: [
    "Gostaríamos de saber como foi sua experiência. Por favor, deixe sua avaliação aqui: [Link de Avaliação].",
  ],
  promocoes_fidelidade: [
    "Aproveite nossas promoções especiais! Confira em [Link das Promoções].",
    "Você sabia que temos um programa de fidelidade? Cada pedido acumula pontos que podem ser trocados por descontos! Saiba mais em [Link do Programa de Fidelidade].",
  ],
  informacoes_nutricionais: [
    "Se precisar de informações sobre ingredientes ou restrições alimentares, estou aqui para ajudar.",
  ],
  politica_devolucao: [
    "Em caso de problemas com seu pedido, veja nossa política de devolução e reembolso em [Link da Política].",
  ],
  contatos_emergencia: [
    "Em caso de emergências ou problemas com seu pedido, ligue para (XX) XXXX-XXXX.",
  ],
};

trainingData.forEach(({ intent, examples }) => {
  examples.forEach((example) => manager.addDocument("pt", example, intent));
  responses[intent].forEach((answer) =>
    manager.addAnswer("pt", intent, answer)
  );
});

// Função para treinar e salvar o modelo
async function trainAndSaveModel() {
  await manager.train();
  manager.save();
  console.log("Modelo treinado e salvo.");
}

// Função para carregar o modelo treinado
async function loadModel() {
  manager.load();
  console.log("Modelo carregado.");
}

// Função para configurar e iniciar o bot
async function botDelivery(client) {
  await loadModel(); // Carregar o modelo previamente treinado

  /// Função de tratamento de mensagens
  client.onMessage(async (message) => {
    if (message.isGroupMsg === false) {
      const response = await manager.process("pt", message.body);

      if (response.answer) {
        await client.sendText(message.from, response.answer);
        // Registra a interação
        await logInteraction(message.body, response.intent, response.answer);
      } else {
        // Registrar mensagem não reconhecida
        logUnrecognizedInteraction(message.body);
        await client.sendText(
          message.from,
          "Desculpe, não entendi sua mensagem. Você pode reformular?"
        );
      }
    } else {
      console.log("Mensagem inválida:", message.body);
    }
  });
}

// Função para registrar interações
async function logInteraction(userMessage, detectedIntent, botResponse) {
  const log = {
    userMessage,
    detectedIntent,
    botResponse,
    timestamp: new Date(),
  };
  const logPath = path.join(__dirname, "interactions_log.json");

  fs.readFile(logPath, (err, data) => {
    let logs = [];
    if (!err) {
      logs = JSON.parse(data);
    }
    logs.push(log);
    fs.writeFile(logPath, JSON.stringify(logs, null, 2), (err) => {
      if (err) console.error("Erro ao registrar interação:", err);
    });
  });
}

// Iniciar o treinamento e o bot
(async () => {
  await trainAndSaveModel(); // Treinar e salvar o modelo inicialmente
  //await botBarbearia(); // Iniciar o bot com o modelo treinado
})();

module.exports = { botDelivery };
