//import config from "./config.js";
document.addEventListener("DOMContentLoaded", () => {
  function showAlert(message) {
    const alertsContainer = document.getElementById("alerts");
    const alert = document.createElement("div");
    alert.className = "alert alert-info container";
    alert.textContent = message;
    alertsContainer.appendChild(alert);
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
  const dominio = window.location.hostname;
  const config = {
    debug: true,
    clientId: dominio, // Substitua pelo seu domínio cadastrado na nossa Api
    socketUrl: "https://multapi.site", // Substitua pela URL do servidor
  };

  const socketClient = new SocketClient(config);
  socketClient.initializeSocket();

  socketClient.setBroadcastMessageCallback((message) => {
    showAlert(message.text);
  });
});
