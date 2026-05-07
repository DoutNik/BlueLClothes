const { Router } = require("express");

const router = Router();

const {
  createPreference,
} = require("../controllers/paymentController");

router.post("/create-preference", createPreference);

module.exports = router;