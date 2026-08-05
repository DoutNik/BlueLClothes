const router = require("express").Router();
const {
  getOrders,
} = require("../controllers/OrderControllers");

router.get("/getOrders", getOrders);

module.exports = router;