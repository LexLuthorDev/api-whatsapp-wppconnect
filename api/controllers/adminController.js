
require("dotenv").config();

const {Admin, sequelize} = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // verificar se os campos estão preenchidos e retornar uma mensagem com o nome que nao foi preenchido

    if (!email || !senha) {
      const camposFaltando = [];

      if (!email) camposFaltando.push("email");
      if (!senha) camposFaltando.push("senha");
      // Verifica se há mais de um campo faltando para decidir se a mensagem deve ser pluralizada
      let mensagem;
      if (camposFaltando.length === 1) {
        mensagem = `O campo ${camposFaltando[0]} precisa ser preenchido`;
      } else if (camposFaltando.length > 1) {
        mensagem = `Os campos ${camposFaltando.join(
          ", "
        )} precisam ser preenchidos`;
      } else {
        mensagem = ""; // Se nenhum campo está faltando, não há mensagem de erro
      }
      return res.status(400).json({
        message: mensagem,
        success: false,
      });
    }

    // Verifique se o email existe no banco de dados.
    const usuario = await Admin.findOne({
      include: [{ association: "dadosAcesso", where: { email } }],
    });

    // Retornar uma mensagem de erro caso o email não exista.
    if (!usuario) {
      return res.status(404).json({
        message: "Email não encontrado",
        success: false,
      });
    }

    // Compare a senha enviada com a senha hasheada no banco de dados.
    const senhaCorreta = await bcrypt.compare(senha, usuario.dadosAcesso.senha);

    if (senhaCorreta) {
      // A senha está correta. Você pode gerar um token JWT.
      const token = jwt.sign(
        { userId: usuario.id, email: usuario.dadosAcesso.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Atualize o token no usuário no banco de dados.
      usuario.dadosAcesso.token = token;

      await usuario.dadosAcesso.save();

      // Retorne o token no response.
      return res.status(200).json({
        message: "Login efetuado com sucesso",
        success: true,
        token,
      });
    } else {
      return res.status(401).json({
        message: "Senha incorreta",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
  }
};