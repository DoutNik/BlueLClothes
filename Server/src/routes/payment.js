const router = require("express").Router();
const {
  createPreference,
  webhook,
} = require("../controllers/paymentController");

router.post("/create-preference", createPreference);
router.post("/webhook", webhook);

module.exports = router;