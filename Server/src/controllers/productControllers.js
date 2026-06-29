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
// 🔥 NOTIFICACIÓN ADMINS
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
    }

    if (isProductComplete(product)) {
      product.status = "ready";
      await product.save();
    }

// 🔥 NOTIFICACIÓN ADMINS
await sendNotification({
  io: req.io,

  roleTarget: "admin",

  title: "Nuevo producto publicado",

  message: `${product.category} ${product.title} de ${product.brand} fue creado y publicado por ${req.user.firstName} ${req.user.lastName}`,

  type: "info",

  category: "products",

  priority: "medium",

  entityType: "product",

  entityId: product.id,

  link: `/product-detail/${product.id}`,
});

await sendNotification({
  io: req.io,

  roleTarget: "users",

  title: "Nuevo producto",

  message: `${product.category} ${product.title} de ${product.brand} ya disponible`,

  type: "info",

  category: "products",

  link: `/product-detail/${product.id}`,
});


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

    await product.destroy({ force: true });

    res.json({ message: "Product permanently deleted" });
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

    await sendNotification({
      io: req.io,
      roleTarget: "admin",
      title: "Producto pausado",
      message: `${product.title} fue pausado`,
      type: "warning",
    });

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

    await sendNotification({
      io,
      roleTarget: "admin",
      title: "Producto reactivado",
      message: `${product.title} fue reactivado`,
      type: "info",
    });

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
  getAdminProducts,
};
