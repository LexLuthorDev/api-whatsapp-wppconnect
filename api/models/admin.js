'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Admin.hasOne(models.DadosAcesso, {
        foreignKey: "idUsuario",
        onDelete: "CASCADE", // Isso configura a exclusão em cascata quando o usuário é excluído
        as: "dadosAcesso",
      });
    }
  }
  Admin.init({
    nome: DataTypes.STRING,
    tipo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Admin',
  });
  return Admin;
};