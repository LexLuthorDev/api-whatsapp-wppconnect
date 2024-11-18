const { Op } = require("sequelize");

const {
  IntegracaoWhats,
  LogMsgWhats,
  sequelize,
} = require("../models");
const { iniciarWpp, getClient, stopClient } = require("../wppconnect");

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx"); // Importando a biblioteca xlsx

exports.enviarMensagem = async (req, res) => {
  try {
    let { msg, destinatario, nomeSecao } = req.body;

    //const apiKey = req.headers["x-mult-api-key"];
    //const { nomeSecao } = await decodificarApiKey(apiKey);
    //console.log("nomeSecao", nomeSecao);
    destinatario = destinatario + "@c.us";

    const nomeSecaoSerializado = nomeSecao
      .toLowerCase() // Converte toda a string para minúsculas
      .replace(/\s+/g, "") // Remove todos os espaços em branco
      .trim(); // Remove espaços no começo e no final da string
    //console.log("nomeSecaoSerializado", nomeSecaoSerializado);
    //return;
    const client = await getClient(nomeSecaoSerializado);

    if (!client) {
      return res.status(404).json({
        message: "Integracao não encontrado ou não iniciado.",
        success: false,
      });
    }

    // Verifica se uma mensagem semelhante foi enviada nos últimos 60 segundos
    const umMinutoAtras = new Date(Date.now() - 60 * 1000);

    const existingMessage = await LogMsgWhats.findOne({
      where: {
        destinatario,
        mensagem: msg,
        createdAt: {
          [Op.gte]: umMinutoAtras,
        },
      },
    });

    if (existingMessage) {
      console.log("Mensagem duplicada detectada nos primeiros 60 segundos.");
      return res.status(409).json({
        message: "Mensagem duplicada detectada nos últimos 60 segundos.",
        success: false,
      });
    }
    const resposta = await client.sendText(destinatario, msg);

    /*await LogMsgWhats.create({
      apiKey,
      destinatario,
      mensagem: msg,
      resposta,
      status: 1,
    });
    */

    return res.status(200).json({ message: "Mensagem enviada", success: true });
  } catch (error) {
    console.log("error", error);
    await LogMsgWhats.create({
      apiKey: req.headers["x-mult-api-key"] || "verificar erro",
      destinatario,
      mensagem: msg,
      resposta: error.message,
      status: 2,
    });
    res.status(500).json({ error: "Erro ao enviar." });
  }
};

exports.enviarMensagemComImagem = async (req, res) => {
  try {
    let { msg, destinatario, nomeSecao, urlImagem } = req.body;

    destinatario = destinatario + "@c.us";

    const nomeSecaoSerializado = nomeSecao
      .toLowerCase()
      .replace(/\s+/g, "")
      .trim();

    const client = await getClient(nomeSecaoSerializado);

    if (!client) {
      return res.status(404).json({
        message: "Integração não encontrada ou não iniciada.",
        success: false,
      });
    }

    // Verificar se a mensagem já foi enviada nos últimos 60 segundos
    const umMinutoAtras = new Date(Date.now() - 60 * 1000);

    const existingMessage = await LogMsgWhats.findOne({
      where: {
        destinatario,
        mensagem: msg,
        createdAt: {
          [Op.gte]: umMinutoAtras,
        },
      },
    });

    if (existingMessage) {
      return res.status(409).json({
        message: "Mensagem duplicada detectada nos últimos 60 segundos.",
        success: false,
      });
    }

    // Enviar a mensagem com imagem
    await client
      .sendImage(
        destinatario,
        urlImagem,
        "imagem.jpg", // Nome do arquivo, pode ser alterado conforme necessário
        msg // Texto que acompanha a imagem
      )
      .then(() => {
        console.log("Mensagem com imagem enviada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao enviar mensagem com imagem:", error);
      });

    // Registrar o log da mensagem
    /*await LogMsgWhats.create({
      destinatario,
      mensagem: msg,
      resposta,
      status: 1,
    });*/

    return res
      .status(200)
      .json({ message: "Mensagem com imagem enviada", success: true });
  } catch (error) {
    console.error("Erro ao enviar mensagem com imagem:", error);

    await LogMsgWhats.create({
      apiKey: req.headers["x-mult-api-key"] || "verificar erro",
      destinatario,
      mensagem: msg,
      resposta: error.message,
      status: 2,
    });

    return res
      .status(500)
      .json({ error: "Erro ao enviar a mensagem com imagem." });
  }
};

exports.salvarNumeros = async (req, res) => {
  try {
    const idIntegracao = req.params.idIntegracao;

    const dadosIntegracao = await IntegracaoWhats.findOne({
      where: { id: idIntegracao, status: true },
    });

    if (!dadosIntegracao) {
      return res.status(404).json({
        message: "Integração não encontrada ou não iniciada.",
        success: false,
      });
    }
    let nomeSecao = dadosIntegracao.nomeSecao;
    let tipoArquivo = "csv";

    // Normalizando o nome da sessão
    const nomeSecaoSerializado = nomeSecao
      .toLowerCase()
      .replace(/\s+/g, "")
      .trim();

    const client = await getClient(nomeSecaoSerializado);

    if (!client) {
      return res.status(404).json({
        message: "Integração não encontrada ou não iniciada.",
        success: false,
      });
    }

    // Obtendo as conversas
    const conversas = await client.listChats();

    // Organizar dados para o Excel/CSV
    const dadosExcel = [];
    dadosExcel.push(["Tipo", "Nome", "Número"]);

    // Processando os dois primeiros registros
    for (let i = 0; i < 2 && i < conversas.length; i++) {
      const chat = conversas[i];
      let nome = chat.name || "Desconhecido";
      let numero = chat.id.user;
      let tipo = chat.isGroup ? "Grupo" : "Contato";

      dadosExcel.push([tipo, nome, numero]);
    }

    // Processando os dois últimos registros
    for (let i = Math.max(conversas.length - 2, 2); i < conversas.length; i++) {
      const chat = conversas[i];
      let nome = chat.name || "Desconhecido";
      let numero = chat.id.user;
      let tipo = chat.isGroup ? "Grupo" : "Contato";

      dadosExcel.push([tipo, nome, numero]);
    }

    // Processando as conversas
    /*for (const chat of conversas) {
      let nome = chat.name || "Desconhecido";
      let numero = chat.id.user;
      let tipo = chat.isGroup ? "Grupo" : "Contato";

      if (chat.isGroup) {
        nome = chat.name;
      }

      dadosExcel.push([tipo, nome, numero]);
    }*/

    // Caminho do arquivo e nome do arquivo com base no tipo de arquivo
    const caminhoArquivo = path.join(
      __dirname,
      "../download",
      `${idIntegracao}.${tipoArquivo}`
    );

    if (tipoArquivo === "xlsx") {
      // Gerar arquivo XLSX
      const planilha = xlsx.utils.aoa_to_sheet(dadosExcel);
      const livro = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(livro, planilha, "Conversas");
      xlsx.writeFile(livro, caminhoArquivo);
    } else if (tipoArquivo === "csv") {
      // Gerar arquivo CSV
      const csvConteudo = xlsx.utils.sheet_to_csv(
        xlsx.utils.aoa_to_sheet(dadosExcel)
      );
      fs.writeFileSync(caminhoArquivo, csvConteudo);
    } else {
      return res.status(400).json({
        message: "Tipo de arquivo inválido. Use 'xlsx' ou 'csv'.",
      });
    }

    res.json({
      message: `Números e últimas mensagens das conversas ativas salvos com sucesso em ${tipoArquivo.toUpperCase()}!`,
      downloadLink: `/download/${path.basename(caminhoArquivo)}`, // Link para download
    });
  } catch (error) {
    console.error("Erro ao salvar números:", error);
    res.status(500).json({ message: "Erro ao salvar números das conversas" });
  }
};


exports.criarIntegracaoWhats = async (req, res) => {
  try {
    let nomeSecao = req.body.nomeSecao;
    let numero = req.body.numero;

    let nomeSecaoSerializado = nomeSecao
      .toLowerCase() // Converte toda a string para minúsculas
      .replace(/\s+/g, "") // Remove todos os espaços em branco
      .trim(); // Remove espaços no começo e no final da string

    // Serializar o número de telefone
    let numeroSerializado = numero
      .replace(/\D/g, "") // Remove todos os caracteres que não são dígitos
      .trim(); // Remove espaços extras (se houver)

    // Adiciona o código do país (55)
    if (!numeroSerializado.startsWith("55")) {
      numeroSerializado = "55" + numeroSerializado;
    }

    // procurar se ja existe um integracao com este nome de seção
    const existeIntegracao = await IntegracaoWhats.findOne({
      where: { nomeSecao: nomeSecaoSerializado },
    });
    if (existeIntegracao) {
      return res.status(200).json({
        message: "Favor escolher outro nome para sua seção",
        success: false,
      });
    }

    const transaction = await sequelize.transaction();

    // Exemplo de uso
    //const apiKey = await gerarApiKey(nomeSecaoSerializado, idUsuario);

    await IntegracaoWhats.create(
      {
        nomeSecao: nomeSecaoSerializado,
        numero: numeroSerializado,
        //idUsuario,
        status: false,
        //apiKey: apiKey,
      },
      { transaction }
    );
    await transaction.commit();

    return res
      .status(200)
      .json({ message: "Integração Criada com sucesso", success: true });
  } catch (error) {
    console.error("Erro ao criar:", error);
    res
      .status(500)
      .json({ message: "Erro ao criar integração.", success: false });
  }
};

exports.listarMinhaIntegracao = async (req, res) => {
  try {
    const nomeSecao = req.params.nomeSecao;

    const integracoesWhatsapp = await IntegracaoWhats.findAll({});

    if (!integracoesWhatsapp.length) {
      return res.status(200).json({
        message: "Nenhuma integração criada.",
        success: true,
        integracoesWhatsapp: [],
      });
    }

    return res
      .status(200)
      .json({ integracoesWhatsapp: integracoesWhatsapp, success: true });
  } catch (error) {
    console.error("Erro ao pesquisar todas integrações:", error);
    res
      .status(500)
      .json({ error: "Erro ao pesquisar todas integrações:", error });
  }
};

exports.iniciarIntegracaoWhats = async (req, res) => {
  //
  try {
    // esperar 5 segundos e retornar um resposta 200
    //await new Promise((resolve) => setTimeout(resolve, 5000));
    //return res.status(200).json({ message: "Integracao iniciada com sucesso", success: true });

    const { idIntegracao } = req.params;

    // Busca o integracao pelo idIntegracao, garantindo que o status seja false
    const integracao = await IntegracaoWhats.findOne({
      where: { id: idIntegracao, status: false },
    });

    if (!integracao) {
      return res.status(404).json({
        message: "Integracao whats não encontrada ou já iniciada.",
        success: false,
      });
    }

    // Atualiza o status da integracao para true após iniciada
    const nomeSecao = integracao.nomeSecao;
    const numero = integracao.numero;

    const client = await iniciarWpp(nomeSecao, numero);

    if (!client) {
      return res.status(404).json({
        message: "Integracao Whats não encontrada ou não iniciada.",
        success: false,
      });
    }

    integracao.status = true;
    await integracao.save();

    return res
      .status(200)
      .json({ message: "Integracao iniciada com sucesso", success: true });
  } catch (error) {
    console.error("Erro ao iniciar a integracao:", error);
    res.status(500).json({ error: "Erro ao iniciar a Integracao Whats." });
  }
};

exports.pararIntegracaoWhats = async (req, res) => {
  try {
    const { idIntegracao } = req.params;
    const integracao = await IntegracaoWhats.findOne({
      where: { id: idIntegracao, status: true },
    });

    if (!integracao) {
      return res
        .status(404)
        .json({ error: "Integracao não encontrado ou já parado." });
    }

    integracao.status = false;
    await integracao.save();
    const nomeSecao = integracao.nomeSecao;
    await stopClient(nomeSecao);

    return res.status(200).json({
      message: "Integracao parado com sucesso",
      success: true,
      stop: true,
    });
  } catch (error) {
    console.error("Erro ao parar o integracao:", error);
    res.status(500).json({ error: "Erro ao parar o integracao." });
  }
};

const deleteDirectory = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.rm(dirPath, { recursive: true, force: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const retryDeleteDirectory = async (dirPath, retries = 3, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await deleteDirectory(dirPath);
      console.log(`Diretório ${dirPath} deletado com sucesso`);
      return;
    } catch (err) {
      if (err.code === "EBUSY" && i < retries - 1) {
        console.log(
          `Tentativa de deletar novamente o diretório ${dirPath} após ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
};

exports.deletarIntegracaoWhats = async (req, res) => {
  try {
    const { idIntegracao } = req.params;
    const integracao = await IntegracaoWhats.findOne({
      where: { id: idIntegracao },
    });

    if (!integracao) {
      return res
        .status(404)
        .json({ error: "Integracao não encontrada ou não iniciada." });
    }
    const nomeSecao = integracao.nomeSecao;
    await stopClient(nomeSecao);
    await integracao.destroy();
    // Se o bot é da tabela BotWhats, excluir o diretório correspondente
    const integracaoSecaoDir = path.join(process.cwd(), "tokens", nomeSecao);
    if (fs.existsSync(integracaoSecaoDir)) {
      try {
        await retryDeleteDirectory(integracaoSecaoDir);
      } catch (err) {
        console.error(
          `Erro ao deletar o diretório ${integracaoSecaoDir}:`,
          err
        );
        return res
          .status(500)
          .json({ error: "Erro ao deletar o diretório do bot." });
      }
    } else {
      console.log(`Diretório ${integracaoSecaoDir} não encontrado`);
    }
    return res
      .status(200)
      .json({ message: "Integracao deletada com sucesso", success: true });
  } catch (error) {
    console.error("Erro ao deletar o integracao:", error);
    res.status(500).json({ error: "Erro ao deletar o integracao." });
  }
};

