const multer = require("multer");
const formatResult = require("../helpers/formatResult");
require("dotenv").config(); // Import env Config

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.route.path === "/" && req.route.stack[0].method === "put") {
      req.body.avatar = `${process.env.HOST}${process.env.STATIC_FOLDER}/${
        Date.now() + "_" + file.originalname
      }`;
    } else {
      req.body.image = `${process.env.HOST}${process.env.STATIC_FOLDER}/${
        Date.now() + "_" + file.originalname
      }`;
    }
    cb(null, "./upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
 
const upload = (name) =>
  multer({
    storage: storage,
    limits: {
      fileSize: 5000000,
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
      }
    },
  }).single(name);

const middleUpload = (key) => (req, res, next) => {
  upload(key)(req, res, (err) => {
    if (err) {
      if (err.message) {
        formatResult(res, 400, false, err.message, null);
      } else {
        formatResult(res, 400, false, "Only .png, .jpg and .jpeg format allowed!", null);
      }
    } else {
      next();
    } 
  });
};

module.exports = middleUpload;
