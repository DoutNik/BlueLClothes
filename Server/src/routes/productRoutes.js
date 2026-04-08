// routes/productRoutes.js
const { Router } = require("express");
const router = Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  suspendProduct,
  activateProduct,
} = require("../controllers/productControllers");

// CRUD
router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Extra lógica negocio
router.patch("/:id/suspend", suspendProduct);
router.patch("/:id/activate", activateProduct);

module.exports = router;