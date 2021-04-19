const wallet = require("../controllers/wallet");
const { AuthAdmin, Auth } = require("../middleware/auth");

const router = require("express").Router();

router.get("/", Auth, wallet.getWallet);
router.get("/dashboard", Auth, wallet.dashboard);

module.exports = router;
