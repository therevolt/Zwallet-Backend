const otp = require("../controllers/otp");
const { AuthAdmin, Auth } = require("../middleware/auth");

const router = require("express").Router();

router.post("/", Auth, otp.sendOTP);
router.post("/compare", Auth, otp.compareOTP);

module.exports = router;
