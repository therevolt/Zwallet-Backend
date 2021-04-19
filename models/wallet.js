module.exports = (sequelize, Sequelize) => {
  const Wallet = sequelize.define("wallet", {
    userId: {
      type: Sequelize.STRING,
    },
    balance: {
      type: Sequelize.INTEGER,
    },
  });

  return Wallet;
};
