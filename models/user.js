module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    userId: {
      type: Sequelize.STRING,
    },
    firstName: {
      type: Sequelize.STRING(64),
      defaultValue: "ZWallet",
    },
    lastName: {
      type: Sequelize.STRING(64),
      defaultValue: "Users",
    },
    username: {
      type: Sequelize.STRING(20),
      defaultValue: "(GEN-Z)Wallet",
    },
    email: {
      type: Sequelize.STRING(64),
    },
    password: {
      type: Sequelize.STRING(64),
    },
    secretPin: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.ENUM,
      values: ["male", "female"],
      defaultValue: "male",
    },
    role: {
      type: Sequelize.ENUM,
      values: ["admin", "user"],
      defaultValue: "user",
    },
    address: {
      type: Sequelize.STRING(128),
      defaultValue: "InCafe No.33",
    },
    phone: {
      type: Sequelize.STRING(14),
      defaultValue: "0",
    },
    birthday: {
      type: Sequelize.DATEONLY,
      defaultValue: Sequelize.NOW,
    },
    avatar: {
      type: Sequelize.STRING,
      defaultValue:
        "https://image.freepik.com/free-vector/modern-people-avatar-casual-clothes-vector-cartoon-illustration-man-with-individual-face-hair-light-digital-frame-dark-blue-computer-picture-web-profile_107791-4258.jpg",
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    incorrectPin: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    disable: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  return User;
};
