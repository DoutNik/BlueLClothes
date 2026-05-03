const router = require("express").Router();
const {
  getOrders,
} = require("../controllers/OrederControllers");

router.get("/", getOrders);

module.exports = router;