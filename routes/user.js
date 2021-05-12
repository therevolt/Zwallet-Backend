const middleUpload = require("../middleware/upload");
const user = require("../controllers/user");
const { AuthAdmin, Auth, AuthRefresh, AuthVerif } = require("../middleware/auth");

const router = require("express").Router();

router.post("/", user.register);
router.get("/", user.getProfile);
router.put("/", Auth, middleUpload("avatar"), user.update);
router.put("/pass", Auth, user.updatePass);
router.post("/resend", user.resendMail);
router.post("/reset", user.requestResetPassword);
router.put("/reset", user.resetPassword);
router.get("/token", AuthRefresh, user.getNewToken);
router.get("/verify", AuthVerif, user.verify);
router.post("/pin", AuthVerif, user.createPin);
router.post("/login", user.login);
router.delete("/phone", Auth, user.deletePhone);
router.delete("/delete/:id", AuthAdmin, user.deleteUser);
router.get("/lists", Auth, user.getListUsers);
router.get("/details", Auth, user.getDetailsPerson);
router.post("/compare", Auth, user.matchPin);
router.post("/change/pin", Auth, user.changePin);
router.put("/disable/:id", AuthAdmin, user.disableAccount);
router.put("/enable/:id", AuthAdmin, user.enableAccount);

module.exports = router;
