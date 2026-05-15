const admin = require("./firebaseAdmin");
const { Notification, User } = require("../DB_config");

const sendNotification = async ({
  io,

  userId = null,

  roleTarget = null,

  title,

  message,

  type = "info",

  category = "system",

  priority = "medium",

  entityType = null,

  entityId = null,

  link = null,

  sendPush = false,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      roleTarget,
      title,
      message,
      type,
      category,
      priority,
      entityType,
      entityId,
      link,
    });

    // SOCKET ADMINS
    if (roleTarget === "admin") {
      io.to("admins").emit("new_notification", notification);
    }

    // SOCKET USER
    if (userId) {
      io.to(`user_${userId}`).emit("new_notification", notification);
    }

    // PUSH NOTIFICATION
    if (sendPush && userId) {
      const user = await User.findByPk(userId);

      if (user?.fcmToken) {
        await admin.messaging().send({
          token: user.fcmToken,

          notification: {
            title,
            body: message,
          },

          webpush: {
            fcmOptions: {
              link: link || "/",
            },
          },

          data: {
            link: link || "/",
          },
        });
      }
    }

    return notification;
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendNotification;
