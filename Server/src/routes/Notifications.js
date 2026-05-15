const router = require("express").Router();
const { Notification } = require("../DB_config");
const auth = require("../middleware/Authorization");

router.put(
  "/read-all",
  auth,
  async (req, res) => {
    try {
      let where = {
        read: false,
      };

      if (req.user.role === "admin") {
        where.roleTarget = "admin";
      } else {
        where.userId = req.user.id;
      }

      await Notification.update(
        {
          read: true,
        },
        {
          where,
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
  auth,
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