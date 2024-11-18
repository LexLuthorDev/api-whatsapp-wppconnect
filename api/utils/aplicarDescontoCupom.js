const { cupon } = require("../models");
async function aplicarDescontoCupom(codigoCupom, totalCarrinho) {
  // Buscar o cupom na tabela 'cupon'
  const cupom = await cupon.findOne({
    where: { codigo: codigoCupom, status: 1 },
  });

  if (!cupom) {
    // Cupom não encontrado ou inválido
    return { desconto: 0, total: totalCarrinho };
  }

  const dataAtual = new Date();
  const dataValidadeCupom = new Date(Date.parse(cupom.dataValidade));
  const dataAtualFormatada = dataAtual.toLocaleDateString("pt-BR");
  const dataValidadeCupomFormatada =
    dataValidadeCupom.toLocaleDateString("pt-BR");

  if (
    dataAtualFormatada > dataValidadeCupomFormatada ||
    cupom.qtdUsos <= 0 ||
    cupom.status === 2
  ) {
    // Cupom expirado ou sem usos disponíveis
    return { desconto: 0, total: totalCarrinho };
  }

  // Calcular o desconto
  let desconto = 0;
  if (cupom.descontoTipo === 2) {
    desconto = cupom.descontoValorFixo;
  } else if (cupom.descontoTipo === 1) {
    desconto = (totalCarrinho * cupom.descontoValorPorcentagem) / 100;
  }

  // Atualizar quantidade de usos do cupom
  await cupom.update({ qtdUsos: cupom.qtdUsos - 1 });

  // Diminuir o valor total do carrinho com o desconto
  const totalComDesconto = totalCarrinho - desconto;

  return { desconto, total: totalComDesconto };
}
module.exports = { aplicarDescontoCupom };
