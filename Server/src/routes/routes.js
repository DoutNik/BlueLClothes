// routes/index.js
const { Router } = require("express");

const productRoutes = require("./productRoutes");
/* const userRoutes = require("./userRoutes");
const orderRoutes = require("./orderRoutes"); */

const router = Router();

router.use("/products", productRoutes);
/* router.use("/users", userRoutes);
router.use("/orders", orderRoutes); */

module.exports = router;