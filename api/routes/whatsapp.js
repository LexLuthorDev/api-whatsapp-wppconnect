const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");
const path = require("path");
const fs = require("fs");

router.get(
  "/:nomeSecao",
  whatsappController.listarMinhaIntegracao
);

router.get("/download/:idIntegracao", (req, res) => {
  const file = `${req.params.idIntegracao}.csv`;
  const filePath = path.join(__dirname, "../download", file);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Arquivo não encontrado:", err);
      return res.status(404).json({ message: "Arquivo não encontrado." });
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error("Erro ao baixar o arquivo:", err);
        res.status(500).json({ message: "Erro ao baixar o arquivo." });
      }
    });
  });
});

router.post("/salvar-numeros/:idIntegracao", whatsappController.salvarNumeros);

// Rota: POST /
router.post("/enviar-mensagem", whatsappController.enviarMensagem);

// Rota: POST /
router.post("/enviar-mensagem-com-imagem", whatsappController.enviarMensagemComImagem);

// Rota: POST /
router.post("/", whatsappController.criarIntegracaoWhats);

router.post(
  "/iniciar/:idIntegracao",
  whatsappController.iniciarIntegracaoWhats
);

router.post("/parar/:idIntegracao", whatsappController.pararIntegracaoWhats);

// rota: deletar integração
router.delete("/:idIntegracao", whatsappController.deletarIntegracaoWhats);

module.exports = router;
