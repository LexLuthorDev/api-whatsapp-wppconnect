## 🚀 Projeto API PARA DISPARO DE MENSAGENS VIA WHATSAPP

Este repositório contém a configuração e desenvolvimento de uma API utilizando Express.js com o Sequelize CLI, pronta para implantação em produção. Ideal para aplicações escaláveis e seguras com banco de dados MySQL.

## 🛠️ Tecnologias e Ferramentas Utilizadas

- Node.js com Express.js para gerenciamento do backend.
- Sequelize para interação com o banco de dados MySQL.
- bcryptjs para criptografia de senhas.
- jsonwebtoken para autenticação.
- dotenv para gerenciamento de variáveis de ambiente.
- body-parser para analisar o corpo das solicitações HTTP.
- multer para upload de arquivos.
- swagger-ui-express para documentação da API.
- swagger-jsdoc para documentação da API.
- wppconnect para envio de mensagens via WhatsApp.

## 📖 Guia de Uso

1.  Criação do Projeto

    ```
    express --no-view api
    cd api
    npm install sequelize mysql2 bcryptjs jsonwebtoken dotenv body-parser multer sequelize-cli swagger-ui-express swagger-jsdoc
    npm install -g controllergenerate

    ```

2. Configuração do Sequelize

    ```
    npx sequelize-cli init
    ```

Criar o model e migração

```

npx sequelize-cli model:create --name Admin --attributes "nome:string, tipo:integer"


npx sequelize-cli model:create --name DadosAcesso --attributes "idUsuario:integer, email:string, senha:string, token:string"


npx sequelize-cli db:create
npx sequelize-cli db:migrate

```

Seeds para População Inicial

```
npx sequelize-cli seed:generate --name admin

npx sequelize-cli db:seed:all

```

3. Criação de Controllers e Rotas

- Criação de Controller

  ```
  controllergenerate generate-controller adminController Admin

  ```

- Criação de Rotas

    ```
    controllergenerate generate-route admin adminController

    ```

### Criar a rota

```
controllergenerate generate-route admin adminController

```

1.  adicionar a rota no arquivo principal `app.js`

    ```

    var indexRouter = require("./routes/index");
    var usersRouter = require("./routes/users");
    let adminRouter = require("./routes/admin");
    let whatsappRouter = require("./routes/whatsapp");


    app.use("/", indexRouter);
    app.use("/users", usersRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/whatsapp", whatsappRouter);
    ```

## ✨ Destaques do Projeto
 - Organização: Uso do express-generator para estrutura modular.
 - Segurança: Autenticação JWT e hash seguro de senhas.
 - Documentação: API documentada com Swagger.
 - Prontidão para Produção: Configurações de servidor (Node.js, MySQL e Nginx) e SSL.

 # 🚀 Guia para Rodar o Projeto Localmente

 Siga os passos abaixo para configurar e executar o projeto em sua máquina local.

## Pré-requisitos

Certifique-se de que você possui os seguintes softwares instalados:

- Node.js (v20.11.0 ou superior)
- MySQL (Servidor de banco de dados)
- Git (para clonar o repositório)

## Passo a Passo

1. Clone o repositório:

   ```
   git clone https://github.com/LexLuthorDev/API-WHATSAPP-WPPCONNECT.git
   ```

2. Instale as dependências:

   ```
   cd API-WHATSAPP-WPPCONNECT
   cd api
   npm install
   ```

3. Configuração do Banco de Dados
 - Crie um banco de dados MySQL com o nome especificado no arquivo config/config.json (veja o próximo passo).
 - Configure o usuário e senha do banco de dados.

4. Inicialize o Banco de Dados

Execute os comandos abaixo para configurar o banco de dados:

   ```
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. Inicie o Servidor

Execute o servidor localmente:

   ```
   npm start
   ```
O servidor será iniciado e estará disponível no endereço:

   http://localhost:3000






### Conclusão

A documentação apresentada descreve o processo completo para configurar uma API utilizando o framework Express.js com a ferramenta express-generator. Ela cobre a criação inicial do projeto.

Se precisar de mais alguma coisa ou tiver alguma dúvida, estou à disposição!

# 📧 Contato

- Email: lexluthordevfull@gmail.com

- Developed with ❤️ by @lexluthor

- Doação: https://github.com/sponsors/LexLuthorDev

Happy coding! 👨🏻‍💻👩‍💻
