const { Router } = require("express");

const {
  Notification,
} = require("../DB_config");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const notifications =
      await Notification.findAll({
        order: [["createdAt", "DESC"]],
      });

    res.json(notifications);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error:
        "Error obteniendo notificaciones",
    });
  }
});

router.put(
  "/:id/read",
  async (req, res) => {
    try {
      const notification =
        await Notification.findByPk(
          req.params.id
        );

      if (!notification) {
        return res.status(404).json({
          error:
            "Notificación no encontrada",
        });
      }

      notification.read = true;

      await notification.save();

      res.json(notification);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Error actualizando notificación",
      });
    }
  }
);

router.put(
  "/read-all",
  async (req, res) => {
    try {
      await Notification.update(
        {
          read: true,
        },
        {
          where: {
            read: false,
          },
        }
      );

      res.sendStatus(200);
    } catch (error) {
      console.log(error);

      res.sendStatus(500);
    }
  }
);

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const notification =
        await Notification.findByPk(
          req.params.id
        );

      if (!notification) {
        return res.status(404).json({
          error:
            "Notificación no encontrada",
        });
      }

      await notification.destroy();

      res.sendStatus(200);
    } catch (error) {
      console.log(error);

      res.sendStatus(500);
    }
  }
);

module.exports = router;