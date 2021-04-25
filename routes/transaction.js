const trx = require("../controllers/transaction");
const { AuthAdmin, Auth } = require("../middleware/auth");

const router = require("express").Router();

router.post("/", Auth, trx.createTrx);
router.get("/data", Auth, trx.dataGraphics);
router.get("/notif", Auth, trx.getDailyNotif);
router.get("/list/all", trx.getListTrx);
router.get("/:id", trx.getTrx);

module.exports = router;
