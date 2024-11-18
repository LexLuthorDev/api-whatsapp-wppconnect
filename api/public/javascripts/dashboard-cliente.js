//console.log("script do dashboard-cliente carregado");
import config from "./config.js";
import { showAlert } from "./showAlert.js";
import { enviarRequisicaoAjax } from "./enviarRequisicaoAjax.js";
// Função para obter o valor do cookie

const { apiURL } = config;

//console.log("apiURL", apiURL);

/* inicio script add integração whats */

document
  .getElementById("add-integracao-whats-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    // Lógica para adicionar nova integração
    const nomeSecao = document.getElementById(
      "integracao-whats-nomeSecao"
    ).value;

    const numero = document.getElementById("integracao-whats-numero").value;

    // Enviar os dados via Ajax

    enviarRequisicaoAjax({
      url: `${apiURL}/whatsapp`,
      metodo: "POST",

      dados: {
        nomeSecao: nomeSecao,
        numero: numero,
      },
      success: function (response) {
        if (!response.success) {
          showAlert(
            response.message,
            "danger",
            3000,
            "#alertPlaceholderAddWhats"
          );
          return;
        }

        // Se a resposta foi bem-sucedida, mostrar uma mensagem de sucesso e atualizar a tabela
        showAlert(
          response.message,
          "success",
          3000,
          "#alertPlaceholderAddWhats"
        );
        setTimeout(function () {
          window.location.reload();
        }, 3000);
      },
      error: function (xhr, status, error) {
        //console.log(xhr);
        setTimeout(function () {
          window.location.reload();
        }, 3000);
        // Se houve um erro na requisição, mostrar uma mensagem de erro
        showAlert(
          xhr.responseJSON.message,
          "danger",
          3000,
          "#alertPlaceholderAddWhats"
        );
      },
    });
  });

/* fim script add integração whats */

/* script buscar minhas integrações */

// Função para preencher a tabela com os bots

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    function () {
      alert("API Key copiada para a área de transferência");
    },
    function (err) {
      console.error("Erro ao copiar: ", err);
    }
  );
}
function populateTable(integracoesWhatsapp) {
  //console.log("integracoesWhatsapp", integracoesWhatsapp);
  const tableBody = document.getElementById("integracoes-table-body");
  tableBody.innerHTML = ""; // Limpar tabela antes de adicionar os dados

  const emptyTableMsg = document.getElementById("empty-table-msg");

  // Verificar se bots é um array e se está vazio
  if (!Array.isArray(integracoesWhatsapp) || integracoesWhatsapp.length === 0) {
    emptyTableMsg.style.display = "block";
    return; // Sair da função se não houver dados para mostrar
  } else {
    emptyTableMsg.style.display = "none";
  }

  integracoesWhatsapp.forEach((integracaoWhatsapp) => {
    const newRow = document.createElement("tr");
    if (integracaoWhatsapp.status) {
      document.getElementById("status-column").innerText = "Desligar";
    } else {
      document.getElementById("status-column").innerText = "Ligar";
    }

    // Verificar o tipo de bot para decidir como preencher a linha da tabela

    newRow.innerHTML = `
      <td class="px-4 py-2 text-left">${integracaoWhatsapp.nomeSecao}</td>
      <td class="px-4 py-2 text-left">${integracaoWhatsapp.numero}</td>
      <td class="px-4 py-2">
        <div class="form-check form-switch">
          <input id="bot-status" class="form-check-input ${
            integracaoWhatsapp.status ? "bg-green-500" : "bg-gray-300"
          } ${integracaoWhatsapp.status ? "border-0" : "border-2"}"
          type="checkbox" role="switch" ${
            integracaoWhatsapp.status ? "checked" : ""
          }
          onchange="toggleBotWhatsStatus(${
            integracaoWhatsapp.id
          }, this.checked)">
        </div>
      </td>
      <td class="px-4 py-2 text-center">
        <button class="btn btn-danger btn-sm fs-5 hover:bg-red-600" onclick="confirmDelete(${
          integracaoWhatsapp.id
        })">
          <i class="bi bi-trash"></i>
        </button>

        <button class="btn btn-success btn-sm text-white fs-5 hover:bg-green-600" onclick="salvarCSV(${
          integracaoWhatsapp.id
        })">
          <i class="bi bi-floppy"></i>
        </button>

        <button class="btn btn-info btn-sm text-white fs-5 hover:bg-blue-600" onclick="downloadCSV(${
          integracaoWhatsapp.id
        })">
          <i class="bi bi-filetype-csv"></i>
        </button>
      </td>
    `;

    tableBody.appendChild(newRow);
  });
}

async function fetchBots() {
  $.ajax({
    url: `${apiURL}/whatsapp/minhas-integracoes`,
    method: "GET",

    success: function (response) {
      console.log("response", response);
      if (!response.success) {
        populateTable([]);
      }

      //console.log("response", response);

      populateTable(response.integracoesWhatsapp);
    },
    error: function (xhr, status, error) {
      console.log("erro", xhr.responseJSON);
      // Se houve um erro na requisição, mostrar uma mensagem de erro
    },
  });
}

/* fim script buscar minhas integrações */

function confirmDelete(idIntegracao) {
  // Preencher o modal de exclusão

  const deleteBtn = document.getElementById("deleteIntegracaoBtn");
  deleteBtn.addEventListener("click", () => {
    // Aqui você pode fazer a lógica de exclusão
    // enviar requisição para excluir o bot via ajax
    enviarRequisicaoAjax({
      url: `${apiURL}/whatsapp/${idIntegracao}`,
      metodo: "DELETE",

      success: function (response) {
        // Se a resposta foi bem-sucedida, mostrar uma mensagem de sucesso e atualizar a tabela
        showAlert(
          response.message,
          "success",
          3000,
          "#alertPlaceholderExclusao"
        );
        setTimeout(function () {
          window.location.reload();
        }, 3000);
      },
      error: function (xhr, status, error) {
        console.log(xhr.responseJSON);
        // Se houve um erro na requisição, mostrar uma mensagem de erro
        showAlert(
          xhr.responseJSON.message,
          "danger",
          3000,
          "#alertPlaceholderExclusao"
        );
        setTimeout(function () {
          window.location.reload();
        }, 3000);
      },
    });
    // Fechar o modal após exclusão
    const deleteModal = new bootstrap.Modal(
      document.getElementById("deleteModal")
    );
    deleteModal.hide();
  });
  // Exibir o modal de confirmação
  const modal = new bootstrap.Modal(deleteModal);
  modal.show();
}

function downloadCSV(idIntegracao) {
  // Modifique a URL para forçar o download direto
  const downloadURL = `${apiURL}/whatsapp/download/${idIntegracao}`;
  const a = document.createElement("a");
  a.href = downloadURL;
  a.download = `${idIntegracao}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Mensagem de sucesso opcional
  showAlert(
    "Arquivo sendo baixado",
    "success",
    3000,
    "#alertPlaceholderExclusao"
  );
}

function salvarCSV(idIntegracao) {
  enviarRequisicaoAjax({
    url: `${apiURL}/whatsapp/salvar-numeros/${idIntegracao}`,
    metodo: "POST",

    success: function (response) {
      // Se a resposta foi bem-sucedida, mostrar uma mensagem de sucesso e atualizar a tabela
      showAlert(response.message, "success", 3000, "#alertPlaceholderExclusao");
      setTimeout(function () {
        window.location.reload();
      }, 3000);
    },
    error: function (xhr, status, error) {
      console.log(xhr.responseJSON);
      // Se houve um erro na requisição, mostrar uma mensagem de erro
      showAlert(
        xhr.responseJSON.message,
        "danger",
        3000,
        "#alertPlaceholderExclusao"
      );
      setTimeout(function () {
        window.location.reload();
      }, 3000);
    },
  });

  // Mensagem de sucesso opcional
  //showAlert("Arquivo sendo baixado", "success", 3000, "#alertPlaceholderExclusao");
}

/* script ativar e desativar a integração */

// Função para iniciar ou reiniciar o bot do whats
async function toggleBotWhatsStatus(idIntegracao, isChecked) {
  // Mostrar indicador de carregamento
  $("#loadingOverlay").removeClass("d-none");

  //console.log("chamou a funcao toggleBotWhatsStatus", isChecked);

  const url = isChecked
    ? `${apiURL}/whatsapp/iniciar/${idIntegracao}`
    : `${apiURL}/whatsapp/parar/${idIntegracao}`;

  try {
    enviarRequisicaoAjax({
      url: url,
      metodo: "POST",

      success: function (response) {
        //console.log("response", response);
        // Esconder indicador de carregamento ao receber a resposta
        $("#loadingOverlay").addClass("d-none");
        if (!response.success) {
          //console.log(response.message);
          showAlert(
            response.message,
            "danger",
            3000,
            "#alertPlaceholderTableStatus"
          );
          return;
        }
        if (response.success) {
          // reload page
          window.location.reload();
        }
      },
      error: function (xhr, status, error) {
        console.log(xhr);
        showAlert(
          xhr.responseJSON.message,
          "danger",
          3000,
          "#alertPlaceholderTableStatus"
        );

        // Esconder indicador de carregamento ao receber a resposta
        $("#loadingOverlay").addClass("d-none");
        setTimeout(function () {
          window.location.reload();
        }, 3000);
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar o status da integração:", error);
    alert(
      "Erro ao atualizar o status da integração. Tente novamente mais tarde."
    );
  }
}

//

/* fim script ativar e desativar a integração */

/* QrCode Integração */

// Inicializar o Socket.IO assim que o DOM estiver pronto
const socket = io("http://localhost:3000"); // Substitua pela URL do seu servidor
console.log("Socket.IO configurado", socket);

socket.on("QrCode", (qrCode) => {
  //console.log("Novo QrCode recebido:", qrCode.base64Qr);
  const qrCodeImg = qrCode.base64Qr;

  // Exibir a imagem no modal
  $("#qrCodeImage").attr("src", qrCodeImg);

  // Abrir o modal
  $("#qrCodeModal").modal("show");
  // Definir o tempo total em segundos
  let totalTime = 40; // 60 segundos

  // Atualizar o contador regressivo a cada segundo
  let countdownInterval = setInterval(function () {
    totalTime--;
    $("#countdown").text(totalTime);

    // Se o tempo acabou, fechar o modal e limpar o intervalo
    if (totalTime <= 0) {
      clearInterval(countdownInterval);
      $("#qrCodeModal").modal("hide");
      window.location.reload();
      /*setTimeout(function () {

                  }, 500);*/ // Espera 500 milissegundos antes de recarregar a página
    }
  }, 1000); // intervalo de 1 segundo (1000 milissegundos)
});

// Ouvir o evento 'PairingCode' do socket
socket.on("PairingCode", (PairingCode) => {
  console.log("Novo Pairing Code recebido:", PairingCode.str);
  // Adicionar um hífen após a quarta letra
  const formattedCode =
    PairingCode.str.slice(0, 4) + "-" + PairingCode.str.slice(4);
  // Selecionar o container para o Pairing Code
  const pairingCodeContainer = document.getElementById("PairingCodeContainer");

  // Criar um elemento de card para exibir o Pairing Code
  pairingCodeContainer.innerHTML = `
    <div class="card border-primary mb-3">
      <div class="card-body">
        <!-- <h5 class="card-title">Código de Pareamento:</h5> -->
        <p class="card-text display-4 text-primary fw-bold">${formattedCode}</p>
      </div>
    </div>
  `;

  // Abrir o modal
  $("#PairingCodeModal").modal("show");
});

socket.on("Status", (status) => {
  console.log("status:", status);
  if (status.statusSession == "isLogged") {
    $("#qrCodeModal").modal("hide");
  }
  if (
    status.statusSession == "browserClose" ||
    status.statusSession == "qrReadError"
  ) {
    let input_bot_status = document.getElementById("input-bot-status");
    input_bot_status.checked = false;
    $("#qrCodeModal").modal("hide");
  }
});

/* fim QrCode Integração */

// Chamar a função para buscar os bots quando a página carregar
window.onload = fetchBots;
window.copyToClipboard = copyToClipboard;
window.confirmDelete = confirmDelete;
window.toggleBotWhatsStatus = toggleBotWhatsStatus;
window.downloadCSV = downloadCSV;
window.salvarCSV = salvarCSV;
