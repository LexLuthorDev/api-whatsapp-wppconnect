const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { addTrainingData } = require("./train_and_save_model");

const unrecognizedLogPath = path.join(
  __dirname,
  "unrecognized_interactions.json"
);

async function reviewAndLabelUnrecognizedInteractions() {
  fs.readFile(unrecognizedLogPath, (err, data) => {
    if (err) {
      console.error("Erro ao ler o log de interações não reconhecidas:", err);
      return;
    }

    const logs = JSON.parse(data);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let index = 0;

    const askQuestion = () => {
      if (index < logs.length) {
        const log = logs[index];
        console.log(`Interação ${index + 1}/${logs.length}`);
        console.log(`Mensagem do usuário: ${log.userMessage}`);

        rl.question("Qual é a intenção correta? ", (intent) => {
          if (intent) {
            rl.question("Qual deve ser a resposta? ", async (answer) => {
              if (answer) {
                // Adicionar nova intenção e resposta ao modelo
                await addTrainingData(intent, [log.userMessage]);
                // Para adicionar a resposta, é necessário garantir que a função trainAndSaveModel
                // inclua a resposta correta no array responses dentro de train_and_save_model.js
              }
              index++;
              askQuestion();
            });
          } else {
            index++;
            askQuestion();
          }
        });
      } else {
        rl.close();
        // Limpar o arquivo de interações não reconhecidas
        fs.writeFile(unrecognizedLogPath, "[]", (err) => {
          if (err) {
            console.error(
              "Erro ao limpar o log de interações não reconhecidas:",
              err
            );
          } else {
            console.log("Log de interações não reconhecidas limpo.");
          }
        });
      }
    };

    askQuestion();
  });
}

reviewAndLabelUnrecognizedInteractions();
