// controllers/productController.js
const { Product, User } = require("../DB_config");
const sendNotification = require("../utils/sendNotification");

const isProductComplete = (product) => {
  return (
    product.title &&
    product.description &&
    product.price &&
    product.stock &&
    product.imageUrl &&
    product.category &&
    product.colors
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

    if (!isProductComplete(product)) {
      await sendNotification({
        io: req.io,
        roleTarget: "admin",
        title: "Nuevo producto en borrador",
        message: `${product.category} ${product.title} de ${product.brand} fue creado por ${req.user.firstName} ${req.user.lastName} y necesita ser completado para su publicación`,
        type: "info",
        category: "products",
        priority: "medium",
        entityType: "product",
        entityId: product.id,
        link: `/product-detail/${product.id}`,
      });
    } else {
      product.status = "ready";
      await product.save();

      await sendNotification({
        io: req.io,
        roleTarget: "admin",
        title: "Nuevo producto listo para revisión",
        message: `${product.category} ${product.title} de ${product.brand} fue creado por ${req.user.firstName} ${req.user.lastName} y está listo para revisión`,
        type: "info",
        category: "products",
        priority: "medium",
        entityType: "product",
        entityId: product.id,
        link: `/product-detail/${product.id}`,
      });
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

    await sendNotification({
      io: req.io,

      roleTarget: "all",

      title: "Nuevo producto",

      message: `${product.category} ${product.title} de ${product.brand} ya disponible`,

      type: "info",

      category: "products",

      link: `/product-detail/${product.id}`,
    });

    res.status(200).json({
      message: "Producto publicado correctamente",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL
const getPublicProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        status: "published",
        isActive: true,
      },
      order: [["createdAt", "DESC"]],
    });

    const productsWithAvailableStock = products.map((product) => {
      const productData = product.toJSON();

      return {
        ...productData,
        availableStock: Math.max(0, product.stock - product.reservedStock),
      };
    });

    res.status(200).json(productsWithAvailableStock);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
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
      paranoid: true,
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

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const productData = product.toJSON();

    productData.availableStock = Math.max(
      0,
      product.stock - product.reservedStock
    );

    res.json(productData);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
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

    await product.destroy({ force: true });

    res.json({ message: "Product permanently deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SUSPEND (no borrar, solo desactivar)
// SUSPEND (pausar producto)
const suspendProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.isActive = false;
    await product.save();

    // Solo notificar si el producto estaba publicado
    if (product.status === "published") {
      await sendNotification({
        io: req.io,
        roleTarget: "all",
        title: "Producto pausado",
        message: `${product.title} fue pausado y ya no está disponible temporalmente.`,
        type: "warning",
        category: "products",
        entityType: "product",
        entityId: product.id,
        link: `/product-detail/${product.id}`,
      });
    }

    res.json({ message: "Product suspended" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ACTIVATE (reactivar producto)
const activateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const availableStock = Math.max(
      0,
      product.stock - product.reservedStock
    );

    if (availableStock <= 0) {
      return res.status(400).json({
        error: "No se puede activar un producto sin stock disponible.",
      });
    }

    product.isActive = true;
    product.status = "published";

    await product.save();

    await sendNotification({
      io: req.io,
      roleTarget: "all",
      title: "Producto disponible nuevamente",
      message: `${product.title} volvió a estar disponible.`,
      type: "info",
      category: "products",
      entityType: "product",
      entityId: product.id,
      link: `/product-detail/${product.id}`,
    });

    res.json({
      message: "Producto activado correctamente",
      product: {
        ...product.toJSON(),
        availableStock,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getPublicProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  suspendProduct,
  activateProduct,
  publishProduct,
  getAdminProducts,
};
