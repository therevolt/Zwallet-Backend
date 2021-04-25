module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    sender: {
      type: Sequelize.STRING,
    },
    receiver: {
      type: Sequelize.STRING,
    },
    amount: {
      type: Sequelize.INTEGER,
    },
    balanceSenderLeft: {
      type: Sequelize.INTEGER,
    },
    balanceReceiverLeft: {
      type: Sequelize.INTEGER,
    },
    notes: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.ENUM,
      values: ["Process", "Pending", "Success", "Failed"],
      defaultValue: "Process",
    },
  });

  return Transaction;
};
