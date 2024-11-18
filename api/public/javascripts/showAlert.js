// Função para mostrar alertas personalizados
function showAlert(message, type, duration = 3000, elemento) {
  console.log(message, type, duration, elemento);
  var alertPlaceholder = $(elemento);
  var alertHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">
                            ${message}
                            <!--<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>-->
                          </div>`;
  alertPlaceholder.html(alertHTML).hide().fadeIn(500); // Suavizar a exibição do alerta

  // Remove o alerta após o tempo especificado com uma animação suave
  setTimeout(function () {
    alertPlaceholder.find(".alert").fadeOut(500, function () {
      $(this).remove();
    });
  }, duration);
}

export { showAlert };
