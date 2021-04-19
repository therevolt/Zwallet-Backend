const trx = require("../controllers/transaction");
const { AuthAdmin, Auth } = require("../middleware/auth");

const router = require("express").Router();

router.post("/", Auth, trx.createTrx);
router.get("/data", Auth, trx.dataGraphics);
router.get("/:id", Auth, trx.getTrx);

module.exports = router;
