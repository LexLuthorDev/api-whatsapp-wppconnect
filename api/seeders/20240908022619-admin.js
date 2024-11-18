"use strict";

require("dotenv").config();
const { criptografarSenha } = require("../utils/helpers"); // Substitua './criptografia' pelo caminho correto do seu arquivo de criptografia

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    // Insira os dados do administrador na tabela 'Admin'
    await queryInterface.bulkInsert(
      "Admins",
      [
        {
          nome: "Lex Luthor",
          tipo: 1, // Supondo que 1 seja o tipo de admin que você deseja inserir
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    const senha = "teste"; // Senha a ser criptografada
    const senhaCriptografada = await criptografarSenha(senha);

    // Insira os dados de acesso na tabela 'DadosAcesso'
    await queryInterface.bulkInsert(
      "DadosAcessos",
      [
        {
          idUsuario: 1, // Substitua 1 pelo id do usuário ao qual esses dados pertencem
          email: "admin@teste.com",
          senha: senhaCriptografada, // Atenção: armazenar senhas em texto plano não é seguro, use hash de senha na prática real
          token: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    // Remova os dados inseridos na tabela 'Admin'
    await queryInterface.bulkDelete("Admins", null, {});

    // Remova os dados inseridos na tabela 'DadosAcesso'
    await queryInterface.bulkDelete("DadosAcessos", null, {});
  },
};
