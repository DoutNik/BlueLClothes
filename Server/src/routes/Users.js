const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../Middleware/Authorization");
const bcrypt = require('bcrypt');
const ADMIN = require('../controllers/Users');

const UsersController = require("../controllers//Users");



