const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const router = require("./src/routes/routes");

const cron = require("node-cron");

const clearAbandonedOrders = require(
  "./jobs/clearAbandonedOrders"
);

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

const morgan = require("morgan");
const cors = require("cors");

app.use(morgan("dev"));

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

io.on("connection", (socket) => {
  console.log(
    "🔌 Usuario conectado:",
    socket.id
  );

  socket.on("join_admin", () => {
    socket.join("admins");

    console.log(
      "👑 Admin conectado"
    );
  });

  socket.on("join_user", (userId) => {
    socket.join(`user_${userId}`);

    console.log(
      `👤 User conectado ${userId}`
    );
  });

  socket.on("disconnect", () => {
    console.log(
      "❌ Usuario desconectado"
    );
  });
});

cron.schedule("*/5 * * * *", () => {
  clearAbandonedOrders(io);
});

app.use(router);

module.exports = {
  httpServer,
};