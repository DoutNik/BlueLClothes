const {
  Notification,
} = require("../DB_config");

const sendNotification = async ({
  io,

  userId = null,

  roleTarget = null,

  title,

  message,

  type = "info",

  entityType = null,

  entityId = null,

  link = null,
}) => {
  try {
    const notification =
      await Notification.create({
        userId,

        roleTarget,

        title,

        message,

        type,

        entityType,

        entityId,

        link,
      });

    // 🔥 ADMINS
    if (roleTarget === "admin") {
      io.to("admins").emit(
        "new_notification",
        notification
      );
    }

    // 🔥 USER
    if (userId) {
      io.to(`user_${userId}`).emit(
        "new_notification",
        notification
      );
    }

    return notification;
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendNotification;