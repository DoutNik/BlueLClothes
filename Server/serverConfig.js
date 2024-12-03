const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const { User, Notifications, Tienda, Compra } = require("./src/DB_config");

const router = require("./src/routes/routes");
const matchsSockets = require("./src/controllers/payController");

const admin = require("firebase-admin");
/* const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://accounts.google.com/o/oauth2/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.CERT_URL
}; */

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const morgan = require("morgan");
const cors = require("cors");
const mercadopago = require("mercadopago");

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());


app.use(function (req, res, next) {

  const allowedOrigins = [
    "http://localhost:5173",
    "https://www.tiendaslocales.com.ar",
    "https://tiendaslocales-production-9ef2.up.railway.app/",
    "http://69.162.124.224",
    "http://63.143.42.240",
    "http://216.245.221.80",
    "http://208.115.199.16",
    "http://216.144.248.16",
    "http://2607:FF68:107::"
  ]; 
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
  }
  next();
});

app.use(router);

module.exports = httpServer;