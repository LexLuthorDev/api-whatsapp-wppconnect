//const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerJson = require("./openapi.json");

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));
};

module.exports = setupSwagger;
