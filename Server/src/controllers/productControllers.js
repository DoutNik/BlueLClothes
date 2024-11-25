const { Product } = require("../DB_config");
const { Op, Sequelize } = require("sequelize");


exports.getProductById = async (id) => {
    try {
      const productById = await Product.findByPk(id);
  
      if (!productById) {
        throw new Error("No product found with the specified id");
      }
  
      return productById;
    } catch (error) {
      throw error;
    }
  };

  exports.getAllProducts = async () => {
    try {
      const allProducts = await Product.findAll();
      return allProducts;
    } catch (error) {
      throw error;
    }
  };

  exports.createProduct = async (productData) => {
    try {
      const newProduct = await Product.create({
        title: productData.title,
        marca: productData.marca,
        description: productData.description,
        price: productData.price,
        desc: productData.desc,
        stock: productData.stock,
        image: productData.image,
      });
      return newProduct;
    } catch (error) {
      console.log("error al crear producto en controller", error);
      throw new Error(error.message);
    }
  };

  exports.updateProduct = async (id, productData) => {
    try {
      const product = await Product.findByPk(id);
  
      if (!product) {
        throw new Error("product not found");
      }
  
      await product.update(productData);
  
      return product;
    } catch (error) {
      throw error;
    }
  };

  exports.updateStock = async (productId, quantity) => {
    try {
      const product = await Product.findByPk(productId);
  
      if (!product) {
        throw new Error("product not found");
      }
  
      product.stock -= quantity;
  
      await product.save();
  
      return product;
    } catch (error) {
      throw error;
    }
  };

  exports.deleteProduct = async (id) => {
    try {
      const product = await Product.findByPk(id);
  
      if (!product) {
        throw new Error("Product not found");
      } else {
        await product.destroy({
          force: true,
        });
      }
  
      return true;
    } catch (error) {
      throw error;
    }
  };

  exports.getProductByName = async (name) => {
    try {
      const products = await Product.findAll({
        where: {
          title: {
            [Op.iLike]: `%${name}%`,
          },
        },
      });
      if (products.length >= 1) return products;
    } catch (error) {
      throw error;
    }
  };