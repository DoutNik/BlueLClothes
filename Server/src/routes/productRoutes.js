const express = require("express");
const router = express.Router();

const productController = require("../controllers/productControllers.js");


router.get("/getAllProducts", async (req, res) => {
    try {
      const allProducts = await productController.getAllProductp();
      return res.status(200).json(allProducts);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  });

  router.get("/getProduct/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const productById = await productController.getProductById(id);
      return res.status(200).json(productById);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  });

  router.Product("/createProduct", async (req, res) => {
    const productData = req.body;
    try {
      console.log(ProductData);
      const newProduct = await productController.createProduct(productData);
  
      return res.status(201).json(newProduct);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  router.put("/updateProduct/:id", async (req, res) => {
    const { id } = req.params;
    const productData = req.body;
    try {
      const updatedProduct = await productController.updateProduct(id, productData);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  });

  router.put("/updateStock/:productId", async (req, res) => {
    const { productId } = req.params;
    const {quantity} = req.body;
    try {
      const updatedProduct = await productController.updateStock(productId, quantity);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  });

  router.delete("/deleteProduct/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedProduct = await productController.deleteProduct(id);
  
      if (deletedProduct) {
        return res.status(200).json("Product successfully deleted");
      } else {
        return res.status(404).json("Product not found");
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: "There was an error deleting the product" });
    }
  });

  router.get("/getProductByName/name", async (req, res) => {
    const { name } = req.query;
    try {
      const product = await productController.getProductByName(name)
      return res.status(200).json(product);
    } catch (error) {
      res.status(500).json({error: "There was an error obtaining the product information", details: error.message});
    }
  })