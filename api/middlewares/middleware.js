require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("../models");

async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}

async function isAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Token não fornecido", success: false });
  }

  const tokenSemBearer = token.replace("Bearer ", "");

  try {
    const decoded = await verifyToken(tokenSemBearer);
    req.user = decoded;
    const admin = await db.Admin.findOne({
      where: { id: decoded.userId, tipo: 1 },
      include: {
        model: db.DadosAcesso,
        as: "dadosAcesso",
        where: { token: tokenSemBearer },
      },
    });

    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin não encontrado", success: false });
    }

    if (admin.tipo !== 1) {
      return res.status(401).json({
        message: "Somente Administradores podem acessar esta rota",
        success: false,
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido", success: false });
  }
}



module.exports = {
  isAdmin
};
