const db = require("../models");
const formatResult = require("../helpers/formatResult");
const { verifyToken, decodeToken } = require("../helpers/jwtHelper");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const Trx = db.transaction;
const User = db.user;
const Wallet = db.wallet;

exports.createTrx = (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  User.findOne({ where: { userId: req.body.receiver } })
    .then((result) => {
      if (result) {
        User.findOne({ where: { userId } }).then(async (resultUserSender) => {
          if (resultUserSender) {
            if (!resultUserSender.secretPin)
              return formatResult(res, 400, false, "Set PIN Before Transaction", null);
            const comparePin = bcrypt.compareSync(req.body.pin, resultUserSender.secretPin);
            if (comparePin) {
              req.body.receiver = result.userId;
              req.body.sender = userId;
              const resultWalletReceiver = await Wallet.findOne({
                where: { userId: result.userId },
              });
              Wallet.findOne({ where: { userId } }).then((resultWalletSender) => {
                if (resultWalletSender) {
                  if (resultWalletSender.balance > parseInt(req.body.amount)) {
                    req.body.balanceSenderLeft =
                      resultWalletSender.balance - parseInt(req.body.amount);
                    req.body.balanceReceiverLeft =
                      resultWalletReceiver.balance + parseInt(req.body.amount);
                    req.body.status = "Success";
                    Trx.create(req.body).then((resultTrx) => {
                      Wallet.update({ balance: req.body.balanceSenderLeft }, { where: { userId } });
                      Wallet.update(
                        { balance: req.body.balanceReceiverLeft },
                        { where: { userId: result.userId } }
                      );
                      formatResult(res, 201, true, "Success", resultTrx);
                    });
                  } else {
                    formatResult(res, 400, false, "Insufficient Balance", null);
                  }
                } else {
                  formatResult(res, 404, false, "You Not Have Wallet", null);
                }
              });
            } else {
              formatResult(res, 400, false, "Wrong Pin Number", null);
            }
          } else {
            formatResult(res, 500, false, "Internal Server Error", null);
          }
        });
      } else {
        formatResult(res, 404, false, "Not Found", null);
      }
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};

exports.dataGraphics = (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  let curr = new Date();
  let first = curr.getDate() - curr.getDay();
  let last = first + 6;
  let firstday = new Date(`${curr.getFullYear()}-${curr.getMonth() + 1}-${first} 07:00:00`);
  let lastday = new Date(`${curr.getFullYear()}-${curr.getMonth() + 1}-${last} 07:00:00`);
  Trx.findAll({
    where: {
      [Op.or]: [{ sender: userId }, { receiver: userId }],
      createdAt: { [Op.between]: [firstday, lastday] },
    },
  })
    .then((result) => {
      const resultNew = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((item, i) => {
        return {
          name: item,
          income: result
            .filter((item) => {
              if (item.receiver === userId) {
                if (new Date(item.createdAt).getDay() === i) {
                  return item.amount;
                }
              }
            })
            .map((item) => item.amount)
            .reduce(function (a, b) {
              return a + b;
            }, 0),
          expense: result
            .filter((item) => {
              if (item.sender === userId) {
                if (new Date(item.createdAt).getDay() === i) {
                  return item.amount;
                }
              }
            })
            .map((item) => item.amount)
            .reduce(function (a, b) {
              return a + b;
            }, 0),
        };
      });
      formatResult(res, 200, true, "Success", resultNew);
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};

exports.getTrx = (req, res) => {
  Trx.findOne({ where: { id: req.params.id } })
    .then((result) => {
      if (result) {
        User.findOne({ where: { userId: result.receiver } }).then((resultUser) => {
          if (resultUser) {
            formatResult(res, 200, true, "Success", {
              amount: result.amount,
              balanceSenderLeft: result.balanceSenderLeft,
              balanceReceiverLeft: result.balanceReceiverLeft,
              date: result.createdAt,
              notes: result.notes,
              senderId: result.sender,
              receiverId: result.receiver,
              receiverName: `${resultUser.firstName} ${resultUser.lastName}`,
              phoneReceiver: resultUser.phone,
              avatarReceiver: resultUser.avatar,
            });
          }
        });
      } else {
        formatResult(res, 400, false, "Transaction Not Found", null);
      }
    })
    .catch(() => {
      formatResult(res, 400, false, "Transaction Not Found", null);
    });
};

exports.getListTrx = (req, res) => {
  Trx.findAll().then((result) => {
    if (result.length > 0) {
      formatResult(
        res,
        200,
        true,
        "Success",
        result.map((item) => item.id)
      );
    } else {
      formatResult(res, 400, false, "Transaction Not Found", null);
    }
  });
};

exports.getDailyNotif = (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  let curr = new Date();
  let first = curr.getDate() - curr.getDay();
  Trx.findAll({
    where: {
      receiver: userId,
      createdAt: {
        [Op.between]: [
          new Date(`${curr.getFullYear()}-${curr.getMonth() + 1}-${first} 07:00:00`),
          new Date(),
        ],
      },
    },
  })
    .then(async (result) => {
      if (result.length > 0) {
        const newResult = [];
        for (let i in result) {
          let user = await User.findOne({ where: { userId: result[i].sender } });
          user = await user.username;
          const json = {
            sender: user,
            amount: result[i].amount,
            status: result[i].status,
            notes: result[i].notes,
          };
          newResult.push(json);
        }
        formatResult(res, 200, true, "Success", newResult);
      } else {
        formatResult(res, 404, false, "You Don't Have Notifications Today");
      }
    })
    .catch((err) => {
      formatResult(res, 400, false, err, null);
    });
};
