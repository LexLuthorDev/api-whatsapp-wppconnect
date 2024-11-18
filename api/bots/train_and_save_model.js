const { NlpManager } = require("node-nlp");
const fs = require("fs");
const path = require("path");

const trainingDataPath = path.join(__dirname, "training_data.json");
const modelPath = path.join(__dirname, "model.nlp");

// Função para carregar dados de treinamento anteriores
function loadTrainingData() {
  if (fs.existsSync(trainingDataPath)) {
    const data = fs.readFileSync(trainingDataPath);
    return JSON.parse(data);
  }
  return [];
}

// Função para salvar dados de treinamento
function saveTrainingData(data) {
  fs.writeFileSync(trainingDataPath, JSON.stringify(data, null, 2));
}

// Função para treinar e salvar o modelo
async function trainAndSaveModel() {
  const manager = new NlpManager({ languages: ["pt"], forceNER: true });

  // Carregar dados de treinamento anteriores
  const trainingData = loadTrainingData();

  trainingData.forEach(({ intent, examples }) => {
    examples.forEach((example) => manager.addDocument("pt", example, intent));
  });

  // Adicionar respostas
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
    // Adicione outras respostas conforme necessário
  };

  for (const [intent, answers] of Object.entries(responses)) {
    answers.forEach((answer) => manager.addAnswer("pt", intent, answer));
  }

  await manager.train();
  manager.save(modelPath);
  console.log("Modelo treinado e salvo.");
}

// Função para adicionar novos dados de treinamento e re-treinar o modelo
async function addTrainingData(intent, examples) {
  let trainingData = loadTrainingData();
  const existingIntent = trainingData.find((data) => data.intent === intent);

  if (existingIntent) {
    existingIntent.examples.push(...examples);
  } else {
    trainingData.push({ intent, examples });
  }

  saveTrainingData(trainingData);
  await trainAndSaveModel();
}

module.exports = { trainAndSaveModel, addTrainingData };
