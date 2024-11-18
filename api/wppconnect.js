const wppconnect = require("@wppconnect-team/wppconnect");
const { getIo } = require("./plugins/socketIo"); // Importa a instância do Socket.IO
const { IntegracaoWhats, sequelize } = require("./models");
const { botDisparo } = require("./bots/disparo");

let clientes = {}; // Objeto para armazenar clientes

async function iniciarWpp(nomeSecao, numero) {
  try {
    let qrCodeBase64 = "";
    const cliente = await wppconnect.create({
      session: nomeSecao,
      phoneNumber: numero,
      puppeteerOptions: {
        userDataDir: `./tokens/${nomeSecao}`, // or your custom directory
        //args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
      },
      statusFind: async (statusSession, session) => {
        // Lógica de status
        //console.log("Status:", statusSession);
        // se o status for isLogged,  enviar para o front o status logado via io~
        const io = getIo();
        io.emit("Status", { statusSession });
      },

      catchQR: async (base64Qr, asciiQR) => {
        // Emitir o evento de novo pedido
        const io = getIo();
        //io.emit("QrCode", { base64Qr });
      },
      catchLinkCode: (str) => { 
        // Emitir o evento de novo pedido
        const io = getIo();
        console.log("PairingCode:", str);
        io.emit("PairingCode", { str });
      },
      headless: true, // Chrome sem interface gráfica
      logQR: true, // Não logar o QR code no terminal
      autoClose: 180000, // Não fechar automaticamente após um tempo false
    });

    // Armazena o cliente no objeto clientes
    clientes[nomeSecao] = cliente;

    await botDisparo(cliente);

    return cliente;
  } catch (error) {
    console.error("Erro ao criar cliente WPPConnect:", error);
    return null;
  }
}

async function getClient(nomeSecao) {
  //console.log("getClient", clientes[nomeSecao]);
  return clientes[nomeSecao];
}

async function stopClient(nomeSecao) {
  try {
    const cliente = clientes[nomeSecao];
    if (cliente) {
      await cliente.close();
      delete clientes[nomeSecao];
      console.log(`Cliente ${nomeSecao} parado.`);
    } else {
      console.log(`Cliente ${nomeSecao} não encontrado.`);
    }
  } catch (error) {
    console.error(`Erro ao parar cliente ${nomeSecao}:`, error);
  }
}

module.exports = { iniciarWpp, getClient, stopClient };
