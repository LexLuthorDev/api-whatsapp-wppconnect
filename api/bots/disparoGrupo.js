async function botDisparoGrupo(client) {
  client.onMessage(async (message) => {
    if (message.body.startsWith("/ENVIAR ")) {
      const texto = message.body.replace("/ENVIAR ", "");
      try {
        await dispararParaGrupos(client, texto);
        await client.sendText(
          message.from,
          "Mensagem disparada para todos os grupos."
        );
      } catch (error) {
        await client.sendText(
          message.from,
          "Erro ao disparar mensagens. Verifique os logs para mais detalhes."
        );
        console.error("Erro ao disparar mensagens:", error);
      }
    } else if (message.body === "/LISTAR_GRUPOS") {
      try {
        const listaGrupos = await listarGrupos(client);
        const nomesGrupos = listaGrupos.join("\n");
        await client.sendText(message.from, `Grupos:\n${nomesGrupos}`);
      } catch (error) {
        await client.sendText(
          message.from,
          "Erro ao listar os grupos. Verifique os logs para mais detalhes."
        );
        console.error("Erro ao listar grupos:", error);
      }
    }
  });
}

async function dispararParaGrupos(client, texto) {
  try {
    const groups = await client.getAllGroups();
    for (const group of groups) {
      await client.sendText(group.id._serialized, texto);
    }
  } catch (error) {
    console.error("Erro ao obter grupos:", error);
  }
}

async function listarGrupos(client) {
  try {
    const groups = await client.getAllGroups();
    return groups.map((group) => group.groupMetadata.subject);
  } catch (error) {
    console.error("Erro ao obter grupos:", error);
    throw error;
  }
}

module.exports = { botDisparoGrupo };
