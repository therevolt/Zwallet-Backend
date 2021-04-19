const db = require("../models");
const { v4: uuidv4 } = require("uuid");
const formatResult = require("../helpers/formatResult");
const bcrypt = require("bcrypt");
const { validAuthUser } = require("../helpers/validator");
const {
  getToken,
  decodeToken,
  verifyToken,
  getTokenReset,
  verifyTokenReset,
  decodeTokenReset,
  getTokenVerify,
  decodeTokenVerify,
  verifyTokenVerify,
  getTokenRefresh,
  decodeTokenRefresh,
} = require("../helpers/jwtHelper");
const sendMail = require("../middleware/mailer");
const User = db.user;
const Wallet = db.wallet;

exports.register = (req, res) => {
  const check = validAuthUser(req.body);
  if (check === true && req.body.email) {
    User.findOne({ where: { email: req.body.email } }).then(async (resultFind) => {
      if (resultFind) {
        return formatResult(res, 400, false, "Email Already Registered!", null);
      } else {
        req.body.userId = uuidv4();
        req.body.password = await bcrypt.hash(req.body.password, 10).then((result) => result);
        User.create(req.body)
          .then(() => {
            sendMail(req.body.email, {
              name: req.body.email.split("@")[0],
              text: `Sebelum Menggunakan Aplikasi Anda Harus Verifikasi Email`,
              url: `${process.env.DOMAIN}/verify?token=${getTokenVerify(req.body)}`,
              textBtn: "Verif Now",
            });
            formatResult(res, 201, true, "Success Register, Please Verify Your Email!", null);
          })
          .catch((err) => {
            formatResult(res, 500, false, err, null);
          });
      }
    });
  } else {
    formatResult(res, 400, false, "Some Field Cannot Be Empty", check[0]);
  }
};

exports.verify = (req, res) => {
  const verify = verifyTokenVerify(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeTokenVerify(req);
  const email = decode.email;
  User.findOne({ where: { email } }).then((resultCheck) => {
    if (resultCheck) {
      if (!resultCheck.dataValues.active) {
        User.update({ active: true }, { where: { email } })
          .then((result) => {
            if (result[0] === 1) {
              formatResult(res, 200, true, "Success Active Your Account!", null);
            } else {
              formatResult(res, 404, false, "Account Not Found", null);
            }
          })
          .catch((err) => {
            formatResult(res, 400, false, err, null);
          });
      } else {
        formatResult(res, 400, false, "Your Account Already Actived", null);
      }
    } else {
      formatResult(res, 404, false, "Account Not Found", null);
    }
  });
};

exports.createPin = (req, res) => {
  const verify = verifyTokenVerify(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeTokenVerify(req);
  const email = decode.email;
  User.findOne({ where: { email } }).then(async (resultCheck) => {
    if (resultCheck) {
      if (resultCheck.dataValues.active) {
        const pin = await bcrypt.hash(req.body.pin, 10);
        User.update({ secretPin: pin }, { where: { email } })
          .then((result) => {
            if (result[0] === 1) {
              Wallet.findAll({ where: { userId: resultCheck.dataValues.userId } }).then(
                (resultWallet) => {
                  if (resultWallet.length > 0) {
                    formatResult(res, 400, false, "You Already Set PIN & Create Wallet", null);
                  } else {
                    Wallet.create({ userId: resultCheck.dataValues.userId, balance: 0 })
                      .then(() => {
                        formatResult(res, 200, true, "Success Set PIN & Create Wallet", null);
                      })
                      .catch(() => {
                        formatResult(res, 500, false, "Internal Server Error", null);
                      });
                  }
                }
              );
            } else {
              formatResult(res, 404, false, "Account Not Found", null);
            }
          })
          .catch((err) => {
            formatResult(res, 400, false, err, null);
          });
      } else {
        formatResult(res, 400, false, "Your Account Not Active", null);
      }
    } else {
      formatResult(res, 404, false, "Account Not Found", null);
    }
  });
};

exports.login = async (req, res) => {
  const email = req.body.email;
  const checkEmail = await User.findOne({ where: { email }, order: ["email"] })
    .then((result) => result.dataValues)
    .catch(() => null);
  if (checkEmail) {
    if (!checkEmail.active) {
      formatResult(res, 400, false, "Email Not Verify, Please Verify Your Email!", null);
    } else {
      const password = bcrypt.compareSync(req.body.password, checkEmail.password);
      if (password) {
        delete checkEmail.password;
        delete checkEmail.secretPin;
        const token = getToken(checkEmail);
        const refreshToken = getTokenRefresh(checkEmail);
        formatResult(res, 200, true, "Login Success", { ...checkEmail, token, refreshToken });
      } else {
        formatResult(res, 400, false, "Password Incorrect", null);
      }
    }
  } else {
    formatResult(res, 400, false, "Email Not Registered", null);
  }
};

exports.update = async (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  if (req.body.active) delete req.body.active;
  if (req.body.password) delete req.body.password;
  User.update(req.body, { where: { userId }, order: ["userId"] })
    .then(() => {
      User.findOne({ where: { userId }, order: ["userId"] })
        .then((results) => {
          delete results.dataValues.password;
          delete results.dataValues.secretPin;
          formatResult(res, 200, true, "Data Updated", results);
        })
        .catch((err) => {
          formatResult(res, 500, false, err, null);
        });
    })
    .catch((err) => {
      formatResult(res, 400, false, err, null);
    });
};

exports.updatePass = async (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  if (req.body.password)
    req.body.password = await bcrypt.hash(req.body.password, 10).then((result) => result);
  User.findOne({ where: { userId } }).then(async (resultFind) => {
    const comparePass = await bcrypt.compare(req.body.current_password, resultFind.password);
    if (comparePass) {
      const password = await bcrypt.hash(req.body.new_password, 10);
      User.update({ password }, { where: { userId }, order: ["userId"] })
        .then(() => {
          User.findOne({ where: { userId }, order: ["userId"] })
            .then((results) => {
              delete results.dataValues.password;
              delete results.dataValues.secretPin;
              formatResult(res, 200, true, "Data Updated", results);
            })
            .catch((err) => {
              formatResult(res, 500, false, err, null);
            });
        })
        .catch((err) => {
          formatResult(res, 400, false, err, null);
        });
    } else {
      formatResult(res, 400, false, "Incorrect Current Password!", null);
    }
  });
};

exports.getProfile = (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  User.findOne({ where: { userId }, order: ["userId"] })
    .then((result) => {
      delete result.dataValues.password;
      formatResult(res, 200, true, "Success Get Profile", result);
    })
    .catch((err) => {
      formatResult(res, 400, false, err, null);
    });
};

exports.requestResetPassword = (req, res) => {
  if (req.body.email) {
    const email = req.body.email;
    User.findOne({ where: { email }, order: ["email"] })
      .then((result) => {
        if (result) {
          const TokenReset = getTokenReset(req.body);
          sendMail(email, {
            name: req.body.email.split("@")[0],
            text: `Anda Melakukan Request Untuk Reset Password`,
            url: `${process.env.DOMAIN}/reset?token=${TokenReset}`,
            textBtn: "Reset Now",
          });
          formatResult(res, 200, true, "Success Request Reset Password", null);
        } else {
          formatResult(res, 404, false, "Email Not Registered", null);
        }
      })
      .catch((err) => {
        formatResult(res, 400, false, err, null);
      });
  } else {
    formatResult(res, 404, false, "Field Email Required", null);
  }
};

exports.resetPassword = async (req, res) => {
  const verify = verifyTokenReset(req);
  if (req.body.password && verify === true) {
    const decode = decodeTokenReset(req);
    const email = decode.email;
    req.body.password = await bcrypt.hash(req.body.password, 10).then((result) => result);
    User.update(req.body, { where: { email } })
      .then((result) => {
        if (result.length === 1) {
          formatResult(res, 200, true, "Success Reset Password", null);
        } else {
          formatResult(res, 500, false, "Internal Server Error", null);
        }
      })
      .catch((err) => {
        formatResult(res, 500, false, err, null);
      });
  } else {
    formatResult(res, 500, false, "Your Data Incorrect", null);
  }
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  const deleted = await User.destroy({ where: { id } });
  if (deleted === 1) {
    formatResult(res, 200, true, "Success Deleted", null);
  } else {
    formatResult(res, 404, false, "User Not Found", null);
  }
};

exports.getData = (req, res) => {
  User.findAll()
    .then((result) => {
      formatResult(res, 200, true, "Success Get Users", result);
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};

exports.getNewToken = async (req, res) => {
  if (req.headers["authorization"]) {
    const checkEmail = decodeTokenRefresh(req);
    if (!checkEmail.active) {
      formatResult(res, 400, false, "Email Not Verify, Please Verify Your Email!", null);
    } else {
      delete checkEmail.iat;
      delete checkEmail.exp;
      const token = getToken(checkEmail);
      const refreshToken = getTokenRefresh(checkEmail);
      formatResult(res, 200, true, "Login Success", { ...checkEmail, token, refreshToken });
    }
  } else {
    formatResult(res, 400, false, "Email Not Registered", null);
  }
};

exports.resendMail = (req, res) => {
  const email = req.body.email;
  User.findOne({ where: { email } })
    .then(async (result) => {
      if (result) {
        if (!result.dataValues.active) {
          await sendMail(req.body.email, {
            name: req.body.email.split("@")[0],
            text: `Sebelum Menggunakan Aplikasi Anda Harus Verifikasi Email`,
            url: `${process.env.DOMAIN}/verify?token=${getTokenVerify(req.body)}`,
            textBtn: "Verif Now",
          });
          formatResult(res, 200, true, "Success Resend Verify Mail", null);
        } else {
          formatResult(res, 400, false, "Account Already Active", null);
        }
      } else {
        formatResult(res, 404, false, "Account Not Found", null);
      }
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};

exports.deletePhone = async (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  if (req.body.password) delete req.body.password;
  User.update({ phone: "" }, { where: { userId } })
    .then(() => {
      User.findOne({ where: { userId } })
        .then((results) => {
          delete results.dataValues.password;
          delete results.dataValues.secretPin;
          formatResult(res, 200, true, "Data Updated", results);
        })
        .catch((err) => {
          formatResult(res, 500, false, err, null);
        });
    })
    .catch((err) => {
      formatResult(res, 400, false, err, null);
    });
};

exports.getListUsers = (req, res) => {
  const verify = verifyToken(req);
  const dataUserHaveWallet = [];
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  User.findAll()
    .then(async (result) => {
      if (result.length > 0) {
        for (let i in result) {
          if (result[i].userId !== userId) {
            await Wallet.findOne({ where: { userId: result[i].userId } })
              .then((resultCheck) => {
                if (resultCheck) {
                  dataUserHaveWallet.push({
                    userId: result[i].userId,
                    avatar: result[i].avatar,
                    fullName: `${result[i].firstName} ${result[i].lastName}`,
                    phone: result[i].phone,
                  });
                }
              })
              .catch((errs) => {
                formatResult(res, 500, false, errs, null);
              });
          }
        }
        formatResult(res, 200, true, "Success", dataUserHaveWallet);
      }
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};

exports.getDetailsPerson = (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  User.findOne({ where: { userId: req.query.userId } })
    .then((result) => {
      formatResult(res, 200, true, "Success", {
        userId: result.userId,
        avatar: result.avatar,
        fullName: `${result.firstName} ${result.lastName}`,
        phone: result.phone,
      });
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};

exports.matchPin = (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  User.findOne({ where: { userId } })
    .then((result) => {
      if (result.incorrectPin < 3) {
        const compare = bcrypt.compareSync(req.body.pin, result.secretPin);
        if (compare) {
          User.update({ incorrectPin: 0 }, { where: { userId } })
            .then(() => {
              formatResult(res, 200, true, "Pin Confirmed", null);
            })
            .catch((err) => {
              formatResult(res, 500, false, err, null);
            });
        } else {
          const incorrect = result.incorrectPin + 1;
          User.update({ incorrectPin: incorrect }, { where: { userId } })
            .then(() => {
              formatResult(res, 400, false, `Wrong Pin Number (${incorrect}/3)`);
            })
            .catch((err) => {
              formatResult(res, 500, false, err, null);
            });
        }
      } else {
        formatResult(res, 400, false, "You Have Been Blocked, Please Contact Our Support");
      }
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};

exports.changePin = (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  User.findOne({ where: { userId } })
    .then(async (result) => {
      const compare = bcrypt.compareSync(req.body.pin, result.secretPin);
      if (compare) {
        const pin = await bcrypt.hash(req.body.new_pin, 10);
        User.update({ secretPin: pin }, { where: { userId } })
          .then(() => {
            formatResult(res, 200, true, "Success Change PIN", null);
          })
          .catch((err) => {
            formatResult(res, 400, false, err, null);
          });
      } else {
        formatResult(res, 400, false, "Current PIN Incorrect", null);
      }
    })
    .catch((err) => {
      formatResult(res, 500, false, err, null);
    });
};
