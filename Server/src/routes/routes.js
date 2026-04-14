// routes/index.js
const { Router } = require("express");

const productRoutes = require("./productRoutes");
const userRoutes = require("./Users");
const upload = require("../middleware/uploadCloudinary");

//const orderRoutes = require("./orderRoutes"); 

const { uploadImage } = require("../controllers/cloudinary");


const router = Router();

router.use("/products", productRoutes);
router.use("/users", userRoutes);
//router.use("/orders", orderRoutes); 


router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;