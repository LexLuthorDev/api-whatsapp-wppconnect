async function convertParaArray(stringArray) {
  try {
    //console.log(stringArray);

    return JSON.parse(stringArray);
  } catch (error) {
    console.error("Erro ao converter para array:", error);
    return [];
  }
}
module.exports = { convertParaArray };
