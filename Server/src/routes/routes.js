// routes/index.js
const { Router } = require("express");

const productRoutes = require("./productRoutes");
const userRoutes = require("./Users");
const upload = require("../middleware/upload");

//const orderRoutes = require("./orderRoutes"); 

const { uploadImage } = require("../controllers/uploadController");


const router = Router();

router.use("/products", productRoutes);
router.use("/users", userRoutes);
//router.use("/orders", orderRoutes); 


router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;