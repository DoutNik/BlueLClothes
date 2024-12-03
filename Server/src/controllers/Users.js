require('dotenv').config();
const bcrypt = require('bcrypt');

exports.ADMIN = {
  username: process.env.ADMIN_USERNAME,
  password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10), // Encriptar al cargar
};


