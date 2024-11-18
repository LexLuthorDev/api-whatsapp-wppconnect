const { NlpManager } = require("node-nlp");

// Configurar o NLP.js
const manager = new NlpManager({ languages: ["pt"], forceNER: true });

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
    intent: "agendamento",
    examples: [
      "quero agendar um horário",
      "preciso marcar um corte de cabelo",
      "gostaria de agendar uma barba",
      "posso marcar um horário?",
      "quero fazer um agendamento",
      "quero agendar um corte de cabelo",
      "quero agendar uma barba",
      "preciso de um horário para corte",
    ],
  },
  {
    intent: "servicos",
    examples: [
      "quais são os serviços disponíveis?",
      "o que vocês oferecem?",
      "quais serviços você tem?",
      "que serviços vocês fazem?",
      "que tipo de corte vocês fazem?",
      "vocês fazem barba?",
      "vocês fazem corte de cabelo?",
      "vocês fazem alisamento?",
    ],
  },
  {
    intent: "horario_funcionamento",
    examples: [
      "qual o horário de funcionamento?",
      "qual é o horário de vocês?",
      "qual é o horário de abertura?",
      "vocês abrem aos finais de semana?",
      "que horas vocês abrem?",
      "até que horas vocês ficam abertos?",
      "qual é o horário de atendimento?",
      "que horas vocês fecham?",
    ],
  },
  {
    intent: "localizacao",
    examples: [
      "onde fica a barbearia?",
      "qual é o endereço?",
      "onde vocês estão localizados?",
      "como eu chego até a barbearia?",
      "onde é a barbearia?",
      "como chegar até vocês?",
      "qual o endereço de vocês?",
      "onde fica a Gomes Barber Shop?",
    ],
  },
  {
    intent: "verificar_horario",
    examples: [
      "Quais são os horários disponíveis para agendamento?",
      "Quais horários estão disponíveis?",
      "Tenho horários disponíveis para hoje?",
      "Qual é a disponibilidade para agendamento?",
      "Quero marcar um horário, quais são os disponíveis?",
    ],
  },
];

const responses = {
  saudacao: [
    "Olá! Bem-vindo à Gomes Barber Shop. Como posso ajudá-lo hoje?",
    "Oi! Como posso ajudar você na Gomes Barber Shop?",
    "Olá! Em que posso ser útil hoje na Gomes Barber Shop?",
  ],
  agendamento: [
    "Claro, posso ajudar com o agendamento. Qual serviço você gostaria de agendar?",
    "Vamos lá, qual serviço você deseja agendar?",
    "Certo, me diga qual serviço você quer agendar.",
  ],
  servicos: [
    "Oferecemos corte de cabelo, barba e outros serviços de cuidado pessoal.",
    "Nossos serviços incluem corte de cabelo, barba e tratamentos capilares.",
    "Fazemos corte de cabelo, barba e alisamento. O que você gostaria?",
  ],
  horario_funcionamento: [
    "Estamos abertos de segunda a sábado, das 9h às 19h.",
    "Nosso horário de funcionamento é de segunda a sábado, das 9h às 19h.",
    "Abrimos de segunda a sábado, das 9h às 19h. Finais de semana sob consulta.",
  ],
  localizacao: [
    "Estamos localizados na Rua Exemplo, 123, Bairro Lami, Porto Alegre.",
    "Nossa barbearia fica na Rua Exemplo, 123, Bairro Lami, Porto Alegre.",
    "Você nos encontra na Rua Exemplo, 123, Bairro Lami, Porto Alegre.",
  ],
  verificar_horario: ["Estou disponível para agendar um horário."],
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
  //manager.save();
  console.log("Modelo treinado e salvo.");
}

// Função para carregar o modelo treinado
async function loadModel() {
  manager.load();
  console.log("Modelo carregado.");
}

// Função para configurar e iniciar o bot
async function botBarbearia(client) {
  await loadModel(); // Carregar o modelo previamente treinado

  // Função de tratamento de mensagens
  client.onMessage(async (message) => {
    if (message.isGroupMsg === false) {
      const response = await manager.process("pt", message.body);
      let respostaFinal;

      if (response.intent === "verificar_horario") {
        const today = new Date().toISOString().split("T")[0];
        const horarios = horariosDisponiveis[today] || [];
        respostaFinal = horarios.length
          ? `Os horários disponíveis para hoje são: ${horarios.join(
              ", "
            )}. Por favor, escolha um horário.`
          : "Não há horários disponíveis para hoje.";
      } else {
        respostaFinal =
          response.answer || "Desculpe, não entendi. Pode repetir?";
      }

      await client.sendText(message.from, respostaFinal);
    } else {
      console.log("Mensagem inválida:", message.body);
    }
  });
}

// Iniciar o treinamento e o bot
(async () => {
  ///await trainAndSaveModel(); // Treinar e salvar o modelo inicialmente
  //await botBarbearia(); // Iniciar o bot com o modelo treinado
})();

module.exports = { botBarbearia };
