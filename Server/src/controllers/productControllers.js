// controllers/productController.js
const { Product } = require("../DB_config");

// CREATE
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET ALL
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
    });
    res.json(products);
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
};