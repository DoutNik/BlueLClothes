const cloudinary = require("../utils/cloudinary");

const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No hay archivo" });
    }

    const category = (req.body.category || "otros")
  .toLowerCase()
  .replace(/\s+/g, "-");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `Hypnotika/Products/${category}`, // 🔥 carpeta dinámica basada en categoría
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        res.json({ imageUrl: result.secure_url });
      },
    );

    stream.end(file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadImage };
