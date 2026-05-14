// controllers/userController.js
const { User } = require("../DB_config");
const  cloudinary  = require("../utils/cludinary");
const sendNotification = require("../utils/SendNotification");
const { io } = require("../../serverConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (req, res) => {
  try {

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      city,
      country,
    } = req.body;

    // VALIDACIÓN
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // EMAIL EXISTENTE
    const existing = await User.findOne({
      where: { email },
    });

    console.log(existing);

    if (existing) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    // HASH PASSWORD
    const hashed = await bcrypt.hash(password, 10);

    // AVATAR CLOUDINARY
    let avatarUrl = null;

    if (req.file) {
      const uploadedImage = await new Promise(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "Hypnotika/Users/Avatars",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          stream.end(req.file.buffer);
        }
      );

      avatarUrl = uploadedImage.secure_url;
    }

    // CREAR USUARIO
    const user = await User.create({
      email,
      password: hashed,
      firstName,
      lastName,
      phone,
      address,
      city,
      country,
      avatar: avatarUrl,
    });

    // NOTIFICACIÓN
    await sendNotification({
      io,
      roleTarget: "admin",
      title: "Nuevo usuario",
      message: `${user.firstName} ${user.lastName} se registró`,
      type: "info",
    });

    // RESPONSE
    res.status(201).json({
      id: user.id,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(404)
        .json({ error: "El email ingresado no se encuentra registrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales inválidas" });

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
