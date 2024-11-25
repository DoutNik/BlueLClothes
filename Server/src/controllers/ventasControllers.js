const { Compra, Post } = require("../DB_config");
const axios = require("axios");
const CryptoJS = require("crypto-js");
require("dotenv").config();
const { ACCESS_TOKEN, CLIENT_ID, CLIENT_SECRET, CRYPTO_KEY, MP_ID, MP_SECRET, PROJECT_ID } = process.env;
const mercadopago = require("mercadopago");
const { Op, Sequelize } = require("sequelize");
const {habStoreMail, enviadoMail, waitingStoreMail, compraMail, ventaMail} = require("../utils/mailObjects");
const { transporter } = require("../config/mailer");
const admin = require("firebase-admin");
let io;

/* exports.getStoresByCategory = async (category) => {
  try {
    if (category === "🔍 Mostrar todas") {
      const stores = await Tienda.findAll();
      return stores;
    }
    const stores = await Tienda.findAll({
      where: {
        categoria: category,
      },
    });

    return stores;
  } catch (error) {
    throw error;
  }
}; */

exports.cancelarVenta = async (compraId) => {
  try {
    const compra = await Compra.findByPk(compraId);

    if (!compra) {
      throw new Error("Compra not found");
    } else {
      const product = await Product.findByPk(compra.ProductId);
      product.stock += compra.quantity;
      await product.save();
      await Compra.destroy({
        where: { id: compraId },
        force: true,
      });
    }

    return true;
  } catch (error) {
    throw error;
  }
};





exports.setSocketIO = (socketIOInstance) => {
    io = socketIOInstance;
  };
  
  exports.createOrder = async (paymentData) => {
  
    try {
      const post = await Post.findOne({
        where: {
          id: paymentData.postId,
        },
      });
      
  
      if (post.stock - paymentData.quantity < 0) {
        post.stock = 0;
      } else {
        post.stock -= paymentData.quantity;
      }
      await post.save();
      const newCompra = await Compra.create({
        userDireccion: paymentData.userDireccion,
        delivery: paymentData.delivery,
        userId: paymentData.userId,
        postId: paymentData.postId,
        storeId: post.storeId,
        title: paymentData.title,
        quantity: paymentData.quantity,
        unit_price: paymentData.price,
        currency_id: paymentData.currency_id,
        description: paymentData.description,
        productImage: post.image,
        enviado: false,
      });
      await newCompra.save();
  
          const buiedProduct =
          paymentData &&
            (await Product.findOne({
              where: {
                id: paymentData.productId,
              },
            }));

          const data = {
            allData: paymentData,
            product: buiedProduct,
            store: store,
          };
  
  
          
  
          await transporter.sendMail(compraMail(data));
          await transporter.sendMail(ventaMail(data));
          
          return true;
   
    } catch (error) {
      throw error;
    }
  }
  
  
  exports.createOrderMP = async (paymentData) => {
    try {
      const decryptedData = CryptoJS.AES.decrypt(
        paymentData.accT,
        secretKey
      ).toString(CryptoJS.enc.Utf8);
  
      mercadopago.configure({
        access_token: decryptedData,
      });
  
      let preference = {
        items: [
          {
            productId: paymentData.productId,
            title: paymentData.title,
            quantity: 1,
            unit_price: paymentData.price,
            description: paymentData.description,
          },
        ],
        back_urls: {
          failure: "https://www.tiendaslocales.com.ar/",
          pending: "https://www.tiendaslocales.com.ar/",
          success: "https://www.tiendaslocales.com.ar/",
        },
        notification_url:
          "https://tiendaslocales-production.up.railway.app/tiendas/webhook",
      };
  
      const response = await mercadopago.preferences.create(preference);
  
      let allData = preference.items[0];
      allData.userDireccion = paymentData.userDireccion;
      allData.quantity = paymentData.quantity;
      allData.token = decryptedData;
  
      const respuesta = { response, allData };
  
      return respuesta;
    } catch (error) {
      throw error;
    }
  };
  
  exports.webhook = async (allData) => {
    try {
      if (allData.data.type === "payment") {
        console.log("allData", allData);
  
        const payID = allData.data["data.id"];
  
        console.log("payID", payID);
        console.log("token", allData.payUserData.token);
  
        response = await axios.get(
          `https://api.mercadopago.com/v1/payments/${payID}?access_token=${allData.payUserData.token}`
        );
  
        console.log("response.data", response.data);
  
        if (response.data.status === "approved") {
          if (allData.payUserData.productId) {
            const product = await Product.findOne({
              where: {
                id: allData.payUserData.productId,
              },
            });
  
            if (product.stock - allData.payUserData.quantity < 0) {
              product.stock = 0;
            } else {
              product.stock -= allData.payUserData.quantity;
            }
            await product.save();
            const newCompra = await Compra.create({
              userDireccion: allData.payUserData.userDireccion,
              delivery: allData.payUserData.delivery,
              userId: allData.payUserData.userId,
              productId: allData.payUserData.productId,
              storeId: product.storeId,
              title: allData.payUserData.title,
              quantity: allData.payUserData.quantity,
              unit_price: allData.payUserData.unit_price,
              currency_id: allData.payUserData.currency_id,
              description: allData.payUserData.description,
              productImage: product.image,
              enviado: false,
            });
            await newCompra.save();
          }
  
          const product =
            allData &&
            (await Product.findOne({
              where: {
                id: allData.payUserData.productId,
              },
            }));
  
          const data = {
            allData: allData,
            comprador: comprador,
            vendedor: vendedor,
            product: product,
            store: store,
          };
  
          await transporter.sendMail(compraMail(data));
          await transporter.sendMail(ventaMail(data));
  
          return true;
        } else {
          console.log("Payment not approved");
          return {
            error: "Payment not approved",
          };
        }
      }
    } catch (error) {
      return {
        error: error.message,
      };
    }
  };
  
  exports.allCompras = async () => {
    try {
      const allCompras = await Compra.findAll();
      return allCompras;
    } catch (error) {
      throw new Error(error);
    }
  };
  
/*   const secretKey = CRYPTO_KEY;
  
  exports.accT = async (code, state) => {
    try {
      const response = await fetch("https://api.mercadopago.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: MP_ID,
          client_secret: MP_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri:
            "https://tiendaslocales-production.up.railway.app/tiendas/redirectUrl",
        }),
      });
  
      const data = await response.json();
      const accessToken = data.access_token;
  
      const encryptedData = CryptoJS.AES.encrypt(
        accessToken,
        secretKey
      ).toString();
  
      const user = await User.findOne({
        where: {
          id: state,
        },
      });
  
      user.accT = encryptedData;
      await user.save();
  
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }; */
  
