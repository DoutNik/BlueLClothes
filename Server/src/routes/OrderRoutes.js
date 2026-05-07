const router = require("express").Router();
const {
  getOrders,
} = require("../controllers/OrderControllers");

router.get("/", getOrders);

module.exports = router;