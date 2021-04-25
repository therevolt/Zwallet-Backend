const dbConfig = require("../configs");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorAliases: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user")(sequelize, Sequelize);
db.wallet = require("./wallet")(sequelize, Sequelize);
db.transaction = require("./transaction")(sequelize, Sequelize);
db.otp = require("./otp")(sequelize, Sequelize);

module.exports = db;
