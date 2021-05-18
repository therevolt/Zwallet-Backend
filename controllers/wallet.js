const db = require("../models");
const formatResult = require("../helpers/formatResult");
const { decodeToken } = require("../helpers/jwtHelper");
const { Op } = require("sequelize");
const Wallet = db.wallet;
const Trx = db.transaction;
const User = db.user;

exports.getWallet = (req, res) => {
  const data = decodeToken(req);
  Wallet.findOne({ where: { userId: data.userId } })
    .then((result) => {
      formatResult(res, 200, true, "Success", result);
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};

exports.getDemoBalance = (req, res) => {
  const data = decodeToken(req);
  const userId = data.userId;
  Wallet.findOne({ where: { userId } })
    .then((resultFindWallet) => {
      if (resultFindWallet) {
        Trx.findAll({ where: { [Op.or]: [{ sender: userId }, { receiver: userId }] } })
          .then((resultFindTrx) => {
            if (resultFindTrx.length === 0 && resultFindWallet.balance === 0) {
              Wallet.update({ balance: 20000 }, { where: { userId } }).then((result) => {
                formatResult(res, 200, true, "Success Get Demo Balance", result);
              });
            } else {
              formatResult(res, 400, false, "Can only take 1 demo balance", null);
            }
          })
          .catch((err) => {
            formatResult(res, 500, false, err, null);
          });
      } else {
        formatResult(res, 404, false, "You Dont Have Wallet", null);
      }
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};

exports.dashboard = (req, res) => {
  const data = decodeToken(req);
  const userId = data.userId;
  const sort = req.query.sort || "desc";
  User.findOne({ where: { userId } }).then((resultUser) => {
    Wallet.findOne({ where: { userId } }).then((resultWallet) => {
      Trx.findAll({
        where: { [Op.or]: [{ sender: userId }, { receiver: userId }] },
        order: [["createdAt", sort]],
      })
        .then(async (result) => {
          if (result.length > 0) {
            const arraySender = result
              .filter((item) => item.sender === userId)
              .map((item) => item.amount);
            const arrayReceiver = result
              .filter((item) => item.receiver === userId)
              .map((item) => item.amount);
            const newResult = [];
            for (let i in result) {
              if (result[i].dataValues.sender === userId) {
                await User.findOne({ where: { userId: result[i].dataValues.receiver } }).then(
                  (resultReceiver) => {
                    newResult.push({
                      nameReceiver: `${resultReceiver.firstName} ${resultReceiver.lastName}`,
                      avatarReceiver: resultReceiver.avatar,
                      ...result[i].dataValues,
                    });
                  }
                );
              } else {
                await User.findOne({ where: { userId: result[i].dataValues.sender } }).then(
                  (resultSender) => {
                    newResult.push({
                      nameSender: `${resultSender.firstName} ${resultSender.lastName}`,
                      avatarSender: resultSender.avatar,
                      ...result[i].dataValues,
                    });
                  }
                );
              }
            }
            if (result.length > 0) {
              formatResult(res, 200, true, "Success", {
                userId: resultUser.userId,
                phone: resultUser.phone,
                balance: resultWallet.balance,
                totalIncome: arrayReceiver.length > 0 ? arrayReceiver.reduce((a, b) => a + b) : 0,
                totalExpense: arraySender.length > 0 ? arraySender.reduce((a, b) => a + b) : 0,
                history: newResult,
              });
            } else {
              formatResult(res, 200, true, "Success", {
                userId: resultUser.userId,
                phone: resultUser.phone,
                balance: resultWallet.balance,
                totalIncome: arrayReceiver.length > 0 ? arrayReceiver.reduce((a, b) => a + b) : 0,
                totalExpense: arraySender.length > 0 ? arraySender.reduce((a, b) => a + b) : 0,
                history: [],
              });
            }
          } else {
            formatResult(res, 200, true, "Success", {
              userId: resultUser.userId,
              phone: resultUser.phone,
              balance: resultWallet.balance,
              totalIncome: 0,
              totalExpense: 0,
              history: [],
            });
          }
        })
        .catch((err) => {
          formatResult(res, 500, false, err, null);
        });
    });
  });
};
