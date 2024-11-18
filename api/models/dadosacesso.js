'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DadosAcesso extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DadosAcesso.init({
    idUsuario: DataTypes.INTEGER,
    email: DataTypes.STRING,
    senha: DataTypes.STRING,
    token: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DadosAcesso',
  });
  return DadosAcesso;
};