const express = require("express");
const router = express.Router();
const tiendasController = require("../controllers/tiendasControllers");
const payController = require("../controllers/payController");

let payUserData;

router.post("/create-order", async (req, res) => {
  const paymentData = req.body;

  try {
    const response = await payController.createOrder(paymentData);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.post("/create-order-MP", async (req, res) => {
  const paymentData = req.body;

  try {
    const response = await payController.createOrderMP(paymentData);
    payUserData = response.allData;
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/success", async (req, res) => {
  try {
    const response = await payController.successfullPurchase(purchaseUserId);
    return res.send("Success");
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/failed", async (req, res) => {
  try {
    return res.send("Failure");
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/pending", async (req, res) => {
  try {
    return res.send("Pending");
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.post("/webhook", async (req, res) => {
  const data = req.query;
  console.log("routeData", data);
  const allData = {
    data: data,
    payUserData: payUserData,
  };
  try {
    const response = await payController.webhook(allData);
    return res.json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/allCompras", async (req, res) => {
  const id = req.body;

  try {
    const response = await payController.allCompras(id);
    return res.json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/comprasRecibidas/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const response = await payController.comprasRecibidas(id);
    return res.json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/redirectUrl", async (req, res) => {
  const { code, state } = req.query;

  try {
    const response = await payController.accT(code, state);
    if (response) {
      const htmlResponse = `
        <html>
          <head>
            <title>Token generado correctamente</title>
            <script>
              alert('Token generado correctamente! Puedes cerrar esta pestaña');
              window.open('', '_self', '');
              window.close();
            </script>
          </head>
        </html>
      `;
      return res.status(200).send(htmlResponse);
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

/* router.get("/categories/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const response = await tiendasController.getStoresByCategory(category);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}); */
router.post("/cancelarVenta", async (req, res) => {
  const compraId = req.body;

  try {
    const response = await tiendasController.cancelarVenta(compraId.id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

module.exports = router;
