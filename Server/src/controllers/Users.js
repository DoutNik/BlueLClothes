// controllers/userController.js
const { User } = require("../DB_config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // VALIDACIÓN
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...req.body,
      password: hashed,
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error(error); // 👈 IMPORTANTE
    res.status(500).json({ error: error });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "El email ingresado no se encuentra registrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

// GET ALL (admin)
const getUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

// GET ONE
const getUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.json(user);
};

// UPDATE
const updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) return res.status(404).json({ error: "Not found" });

  await user.update(req.body);

  res.json(user);
};

// DELETE (soft)
const deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) return res.status(404).json({ error: "Not found" });

  await user.destroy();

  res.json({ message: "User deleted" });
};

module.exports = {
  register,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
