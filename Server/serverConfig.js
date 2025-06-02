const express = require("express");
const { createServer } = require("node:http");

const { User, Notifications, Tienda, Compra } = require("./src/DB_config");

const router = require("./src/routes/routes");



const app = express();
const httpServer = createServer(app);


const morgan = require("morgan");
const cors = require("cors");

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