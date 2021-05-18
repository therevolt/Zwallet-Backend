const wallet = require("../controllers/wallet");
const { AuthAdmin, Auth } = require("../middleware/auth");

const router = require("express").Router();

router.get("/", Auth, wallet.getWallet);
router.get("/dashboard", Auth, wallet.dashboard);
router.get("/demo", Auth, wallet.getDemoBalance);

module.exports = router;
