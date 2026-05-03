// routes/userRoutes.js
const { Router } = require("express");
const router = Router();

const auth = require("../Middleware/Authorization");
const isAdmin = require("../Middleware/isAdmin");

const {
  register,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/Users");

// AUTH
router.post("/register", register);
router.post("/login", login);

// ADMIN
router.get("/", auth, isAdmin, getUsers);

// USER
router.get("/:id", auth, getUser);
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteUser);

module.exports = router;