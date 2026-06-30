const { Notification } = require("../DB_config");
const { Op } = require("sequelize");

// GET ALL
const getNotifications = async (req, res) => {
  try {
    let where = {};

    // ADMIN
    if (req.user.role === "admin") {
      where = {
        [Op.or]: [
          { roleTarget: "admin" },
          { roleTarget: "all" },
          { userId: req.user.id },
        ],
      };
    }

    // USER
    else {
      where = {
        [Op.or]: [
          { userId: req.user.id },
          { roleTarget: "users" },
          { roleTarget: "all" },
        ],
      };
    }

    const notifications = await Notification.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo notificaciones",
    });
  }
};

// MARK ONE AS READ
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({
        error: "Notificación no encontrada",
      });
    }

    // VALIDACION SEGURIDAD
    const isAdminNotification = notification.roleTarget === "admin";

    const isUserNotification = notification.userId === req.user.id;

    const isGlobalUsersNotification = notification.roleTarget === "users";

    const isGlobalNotification = notification.roleTarget === "all";

    if (
      req.user.role !== "admin" &&
      !isUserNotification &&
      !isGlobalUsersNotification &&
      !isGlobalNotification
    ) {
      return res.sendStatus(403);
    }

    if (
      req.user.role === "admin" &&
      !isAdminNotification &&
      !isUserNotification &&
      !isGlobalNotification
    ) {
      return res.sendStatus(403);
    }

    notification.read = true;

    await notification.save();

    res.sendStatus(200);
  } catch (error) {
    console.log(error);

    res.sendStatus(500);
  }
};

// MARK ALL AS READ
const markAllNotificationsRead = async (req, res) => {
  try {
    let where = {
      read: false,
    };

    if (req.user.role === "admin") {
      where = {
        read: false,
        [Op.or]: [
          { roleTarget: "admin" },
          { roleTarget: "all" },
          { userId: req.user.id },
        ],
      };
    } else {
      where = {
        read: false,
        [Op.or]: [
          { userId: req.user.id },
          { roleTarget: "users" },
          { roleTarget: "all" },
        ],
      };
    }

    await Notification.update(
      {
        read: true,
      },
      {
        where,
      },
    );

    res.sendStatus(200);
  } catch (error) {
    console.log(error);

    res.sendStatus(500);
  }
};

// DELETE
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({
        error: "Notificación no encontrada",
      });
    }

const canDelete =
  req.user.role === "admin"
    ? notification.roleTarget === "admin" ||
      notification.roleTarget === "all" ||
      notification.userId === req.user.id
    : notification.userId === req.user.id ||
      notification.roleTarget === "users" ||
      notification.roleTarget === "all";
      
    if (!canDelete) {
      return res.sendStatus(403);
    }

    await notification.destroy();

    res.sendStatus(200);
  } catch (error) {
    console.log(error);

    res.sendStatus(500);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
