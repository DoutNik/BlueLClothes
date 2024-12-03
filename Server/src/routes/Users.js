const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const bcrypt = require('bcrypt');
const ADMIN = require('../controllers/Users');

const UsersController = require("../controllers//Users");



router.get("/ControlPanel", verifyToken, (req, res) => {
  res.json({ message: "Bienvenido al panel de administrador" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Validar credenciales
  if (username !== ADMIN.username) {
    return res.status(401).json({ message: "Usuario incorrecto" });
  }

  const isMatch = await bcrypt.compare(password, ADMIN.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  // Generar token JWT
  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});
