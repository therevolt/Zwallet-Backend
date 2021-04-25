module.exports = (sequelize, Sequelize) => {
  const OTP = sequelize.define("otp", {
    userId: { type: Sequelize.STRING },
    number: {
      type: Sequelize.STRING,
    },
    otp: {
      type: Sequelize.STRING,
    },
  });

  return OTP;
};
