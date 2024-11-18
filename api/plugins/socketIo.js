const http = require("http");
const socketIo = require("socket.io");

let io;
let isEnabled = false; // Controle de habilitação do WebSocket

const initSocket = (server) => {
  io = socketIo(server);

  // Middleware para verificar a habilitação do WebSocket
  io.use((socket, next) => {
    if (isEnabled) {
      return next(); // Permite a conexão se o WebSocket estiver habilitado
    } else {
      // Caso contrário, rejeita a conexão e envia uma mensagem personalizada
      const err = new Error("WebSocket desabilitado");
      err.data = {
        content:
          "O servidor WebSocket está desligado, por favor, tente novamente mais tarde.",
      };
      next(err);
    }
  });

  io.on("connection", (socket) => {
    console.log("Novo cliente conectado");

    // Aqui você pode adicionar mais eventos para o socket
    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
    });
  });
};

const enableSocket = () => {
  if (!isEnabled) {
    isEnabled = true;
    console.log("WebSocket habilitado");
  }
};

const disableSocket = () => {
  if (isEnabled) {
    isEnabled = false;
    console.log("WebSocket desabilitado");
  }
};

const isSocketEnabled = () => {
  return isEnabled;
};

module.exports = {
  initSocket,
  enableSocket,
  disableSocket,
  isSocketEnabled,
  getIo: () => io,
};
