// help.js
const bcrypt = require("bcryptjs");
const { db } = require("../models");

module.exports = {
  async formatarPreco(preco) {
    // Converte o valor para decimal, substituindo a virgula por ponto
    let precoFormatado = parseFloat(preco.replace(",", "."));
    return precoFormatado;
  },
  async serializeName(name) {
    // Remover caracteres especiais, exceto hífens, e substituir espaços por hífens
    let serialized = name.replace(/[^\w\s-]/gi, "").replace(/\s+/g, "-");

    // Converter para minúsculas
    return serialized.toLowerCase();
  },
  async validarCampos(req, campos) {
    let msgErro = "";

    campos.forEach((campo) => {
      if (!req.body[campo]) {
        msgErro += `O campo ${campo} deve ser informado. `;
      }
    });

    return msgErro;
  },
  async criptografarSenha(senha) {
    try {
      const hash = await bcrypt.hash(senha, 10); // O segundo parâmetro é o custo da criptografia
      return hash;
    } catch (error) {
      throw new Error("Erro ao criptografar a senha");
    }
  },
  formatDate: function (date) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  },
  getRandomNumber: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  isEven: function (number) {
    return number % 2 === 0;
  },
};
