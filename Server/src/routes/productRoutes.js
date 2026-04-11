// routes/productRoutes.js
const { Router } = require("express");
const router = Router();

const authMiddleware = require("../middleware/Authorization");
const adminMiddleware = require("../middleware/isAdmin");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  suspendProduct,
  activateProduct,
  publishProduct, // 👈 nuevo
  getAdminProducts, // 👈 opcional pero recomendado
} = require("../controllers/productControllers");


// 🔓 PUBLIC
router.get("/", getAllProducts); // solo debería devolver publicados
router.get("/:id", getProductById);


// 🔐 ADMIN
router.post("/", authMiddleware, adminMiddleware, createProduct);

router.put("/:id", authMiddleware, adminMiddleware, updateProduct);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

// publicar producto (nuevo flujo)
router.put("/:id/publish", authMiddleware, adminMiddleware, publishProduct);

// gestión interna (ver drafts, ready, etc)
router.get("/admin/all", authMiddleware, adminMiddleware, getAdminProducts);


// lógica negocio (también admin)
router.patch("/:id/suspend", authMiddleware, adminMiddleware, suspendProduct);
router.patch("/:id/activate", authMiddleware, adminMiddleware, activateProduct);


module.exports = router;