const db = require("../models");
const formatResult = require("../helpers/formatResult");
const { decodeToken, verifyToken } = require("../helpers/jwtHelper");
const sendSMS = require("../helpers/sendSMS");
const OTP = db.otp;
const User = db.user;

exports.sendOTP = (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  const OTPCode = Math.floor(Math.random() * 999999) + 100000;
  User.findOne({ where: { phone: req.body.number.replace("62", "") } }).then(
    (resultSearchPhone) => {
      if (resultSearchPhone) {
        formatResult(res, 400, false, "Phone Already Used", null);
      } else {
        User.findOne({ where: { userId } }).then((resultUser) => {
          if (resultUser) {
            if (!resultUser.phone || resultUser.phone === "0") {
              OTP.findOne({ where: { userId } }).then((resultFindOTP) => {
                if (resultFindOTP) {
                  OTP.update({ otp: OTPCode }, { where: { userId } }).then(async (resultUpdate) => {
                    if (resultUpdate) {
                      await sendSMS(req.body.number, OTPCode)
                        .then((resultOTP) => {
                          if (resultOTP) {
                            formatResult(res, 200, true, "Success Send OTP", null);
                          } else {
                            console.log();
                            formatResult(res, 500, false, "Internal Server Error", null);
                          }
                        })
                        .catch(() => {
                          formatResult(res, 500, false, "Internal Server Error", null);
                        });
                    } else {
                      formatResult(res, 500, false, "Internal Server Error", null);
                    }
                  });
                } else {
                  OTP.create({ userId, number: req.body.number, otp: "123456" }).then(
                    async (result) => {
                      if (result) {
                        await sendSMS(req.body.number, OTPCode)
                          .then((resultOTP) => {
                            if (resultOTP) {
                              formatResult(res, 200, true, "Success Send OTP", null);
                            } else {
                              console.log();
                              formatResult(res, 500, false, "Internal Server Error", null);
                            }
                          })
                          .catch(() => {
                            formatResult(res, 500, false, "Internal Server Error", null);
                          });
                      } else {
                        formatResult(res, 500, false, "Internal Server Error", null);
                      }
                    }
                  );
                }
              });
            } else {
              formatResult(res, 400, false, "User Already Have Number", null);
            }
          } else {
            formatResult(res, 404, false, "User Not Found");
          }
        });
      }
    }
  );
};

exports.compareOTP = (req, res) => {
  const verify = verifyToken(req);
  if (verify !== true) return formatResult(res, 400, false, verify, null);
  const decode = decodeToken(req);
  const userId = decode.userId;
  OTP.findOne({ where: { userId } }).then((result) => {
    if (result.otp === req.body.otp) {
      User.update({ phone: result.number.replace("62", "") }, { where: { userId } })
        .then((resultUser) => {
          if (resultUser) {
            formatResult(res, 200, true, "Success Verify Phone Number", null);
          } else {
            formatResult(res, 400, false, "Failed Verify Phone Number", null);
          }
        })
        .catch(() => {
          formatResult(res, 500, false, "Internal Sever Error", null);
        });
    } else {
      formatResult(res, 400, false, "OTP Wrong", null);
    }
  });
};
