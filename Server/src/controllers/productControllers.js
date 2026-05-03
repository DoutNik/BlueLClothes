// controllers/productController.js
const { Product } = require("../DB_config");

const isProductComplete = (product) => {
  return (
    product.title &&
    product.description &&
    product.price &&
    product.stock &&
    product.imageUrl &&
    product.category
  );
};

// CREATE
const createProduct = async (req, res) => {
  try {
    const data = req.body;

    const product = await Product.create({
      ...data,
      status: "draft", // siempre arranca como borrador
    });

    if (isProductComplete(product)) {
      product.status = "ready";
      await product.save();
    }

    res.status(201).json({
      message: isProductComplete(product)
        ? "Producto creado y listo para publicar"
        : "Producto guardado como borrador",
      product,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const publishProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (!isProductComplete(product)) {
      return res.status(400).json({
        error: "El producto no está completo. No se puede publicar.",
      });
    }

    // publicar
    product.status = "published";
    await product.save();

    res.status(200).json({
      message: "Producto publicado correctamente",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        status: "published",
        isActive: true,
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};

    // filtro opcional por status (ej: ?status=draft)
    if (status) {
      where.status = status;
    }

    const products = await Product.findAll({
      where,
      paranoid: false, // 👈 incluye eliminados (soft delete)
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.update(req.body);

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE (soft delete con paranoid)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();

    res.json({ message: "Product deleted (soft delete)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SUSPEND (no borrar, solo desactivar)
const suspendProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    product.isActive = false;
    await product.save();

    res.json({ message: "Product suspended" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ACTIVATE (reactivar producto)
const activateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    product.isActive = true;
    await product.save();

    res.json({ message: "Product activated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  suspendProduct,
  activateProduct,
  publishProduct,
  getAdminProducts
};