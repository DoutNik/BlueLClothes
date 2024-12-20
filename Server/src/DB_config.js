require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const { DB_USER, DB_PASSWORD, DB_HOST, DB_DEPLOY } = process.env;

const sequelize = new Sequelize(
  `postgres:${DB_USER}:${DB_PASSWORD}@${DB_HOST}/tiendaslocales`,
  {
    logging: false,
    native: false,
  }
);

/* const sequelize = new Sequelize(DB_DEPLOY, {
  logging: false,
  native: false,
}); */

const basename = path.basename(__filename);

const modelDefiners = [];

fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

modelDefiners.forEach((model) => model(sequelize));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

const {
  Post,
  User,
  Message,
  Chat,
  Favorites,
  Notifications,
  Tienda,
  Review,
  Code,
  Envio,
  Compra,
  Cupones,
} = sequelize.models;

User.hasMany(Compra);
Compra.belongsTo(User);

// User - Post

// User - Chat
User.belongsToMany(Chat, {
  through: "UserChat",
});
Chat.belongsToMany(User, {
  through: "UserChat",
  foreignKey: "chatId",
});
Chat.belongsTo(User, {
  as: "creator",
  foreignKey: "creatorId",
});

// Chat - Message
Chat.hasMany(Message, {
  foreignKey: "chatId",
});
Message.belongsTo(Chat, {
  foreignKey: "chatId",
});

// User - Message
User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sender",
});
Message.belongsTo(User, {
  foreignKey: "senderId",
});
// User - Review
User.hasMany(Review, {
  foreignKey: "userId",
});

Review.belongsTo(User, {
  as: "reviewer",
  foreignKey: "reviewedUserId",
});

// Agregar para almacenar envios
User.hasMany(Envio, {
  foreignKey: "userId",
});

Envio.belongsTo(User, {
  as: "sender",
  foreignKey: "senderUserId",
});

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};
