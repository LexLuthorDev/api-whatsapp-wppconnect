async function enviarRequisicaoAjax(config) {
  // Validação básica do objeto de configuração
  if (!config || typeof config !== "object") {
    console.error("Configuração inválida para a requisição AJAX.");
    return;
  }

  // Extrair os parâmetros da configuração
  var url = config.url;
  var metodo = config.metodo || "GET";
  var dados = config.dados || null;
  var headers = config.headers || {};
  var sucessoCallback = config.success || function () {};
  var erroCallback = config.error || function () {};

  // Adicionar token ao cabeçalho, se necessário
  if (config.token) {
    headers.Authorization = "Bearer " + config.token;
  }

  // Configurar a requisição AJAX
  $.ajax({
    url: url,
    method: metodo,
    contentType: "application/json",
    headers: headers,
    data: dados ? JSON.stringify(dados) : null,
    success: function (response) {
      sucessoCallback(response);
    },
    error: function (xhr, status, error) {
      erroCallback(xhr, status, error);
    },
  });
}

export { enviarRequisicaoAjax };

/* exemplo de uso 
enviarRequisicaoAjax({
      url: `${apiURL}/cliente/login`,
      metodo: "POST",
      dados: {
        email: email,
        senha: senha,
      },
      success: function (response) {
        // Definindo o cookie com o token
        var decodedToken = parseJwt(response.token);
        var expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);
        //console.log(expiresIn);

        document.cookie =
          "authTokenInfinityBot=" +
          response.token +
          "; path=/; max-age=" +
          expiresIn;
        // Definindo o cookie com o token
        showAlert(response.message, "success", 3000, "#alertPlaceholder");
        // Redirecionar para login após 3 segundos
        setTimeout(function () {
          window.location.href = "../painel-cliente/";
        }, 3000);
      },
      error: function (xhr, status, error) {
        showAlert(
          xhr.responseJSON.message,
          "danger",
          3000,
          "#alertPlaceholder"
        );
      },
    });
*/
