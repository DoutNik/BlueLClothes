// middleware/isAdmin.js
module.exports = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "Error en autorización" });
  }
};