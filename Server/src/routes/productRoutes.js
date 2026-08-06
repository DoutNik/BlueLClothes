// routes/productRoutes.js
const { Router } = require("express");
const router = Router();

const authMiddleware = require("../Middleware/Authorization");
const adminMiddleware = require("../Middleware/isAdmin");

const {
  createProduct,
  getPublicProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  suspendProduct,
  activateProduct,
  publishProduct,
  getAdminProducts,
} = require("../controllers/productControllers");

// =======================
// PUBLIC
// =======================

router.get("/", getPublicProducts);

// IMPORTANTE: las rutas específicas van antes de "/:id"
router.get("/admin/all", authMiddleware, adminMiddleware, getAdminProducts);

router.get("/:id", getProductById);

// =======================
// ADMIN
// =======================

router.post("/", authMiddleware, adminMiddleware, createProduct);

router.put("/:id", authMiddleware, adminMiddleware, updateProduct);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

// Publicar
router.put("/:id/publish", authMiddleware, adminMiddleware, publishProduct);

// Pausar
router.put("/:id/suspend", authMiddleware, adminMiddleware, suspendProduct);

// Reactivar
router.put("/:id/activate", authMiddleware, adminMiddleware, activateProduct);

module.exports = router;
