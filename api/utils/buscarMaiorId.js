const db = require("../models");

// Função para buscar o maior ID entre as tabelas fornecidas
async function buscarMaiorID(...tableNames) {
  try {
    const maxIDs = await Promise.all(
      tableNames.map(async (tableName) => {
        const Model = db[tableName];
        if (!Model) {
          throw new Error(`Modelo não encontrado para a tabela: ${tableName}`);
        }
        return await Model.max("id");
      })
    );

    // Encontre o maior ID entre os valores
    const maiorID = Math.max(...maxIDs);

    return maiorID;
  } catch (error) {
    console.error("Ocorreu um erro ao buscar o maior ID:", error);
    throw error;
  }
}

module.exports = buscarMaiorID;
