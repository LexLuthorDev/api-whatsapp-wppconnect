const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Caminho para o arquivo de log
const logPath = path.join(__dirname, "interactions_log.json");

// Função para revisar e rotular interações
async function reviewAndLabelInteractions() {
  // Ler o arquivo de log
  fs.readFile(logPath, (err, data) => {
    if (err) {
      console.error("Erro ao ler o log de interações:", err);
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
        console.log(`Intenção detectada: ${log.detectedIntent}`);
        console.log(`Resposta do bot: ${log.botResponse}`);

        rl.question(
          "Qual é a intenção correta? (Pressione Enter para manter a intenção detectada) ",
          (intent) => {
            if (intent) {
              logs[index].detectedIntent = intent;
            }
            index++;
            askQuestion();
          }
        );
      } else {
        rl.close();
        // Salvar o arquivo de log atualizado
        fs.writeFile(logPath, JSON.stringify(logs, null, 2), (err) => {
          if (err) {
            console.error(
              "Erro ao salvar o log de interações atualizado:",
              err
            );
          } else {
            console.log("Log de interações atualizado com sucesso.");
          }
        });
      }
    };

    askQuestion();
  });
}

reviewAndLabelInteractions();
