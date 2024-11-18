"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class IntegracaoWhats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  IntegracaoWhats.init(
    {
      nomeSecao: DataTypes.STRING,
      numero: DataTypes.STRING,
      idUsuario: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
      apiKey: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "IntegracaoWhats",
    }
  );
  return IntegracaoWhats;
};
