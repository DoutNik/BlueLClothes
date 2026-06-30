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

    console.log("✅ Notification creada");

    // ADMINS
    if (roleTarget === "admin") {
      io.to("admin").emit("new_notification", notification);

      console.log("📡 enviada a admins");
    }

    // USERS
    if (roleTarget === "users") {
      io.to("users").emit("new_notification", notification);

      console.log("📡 enviada a users");
    }

    // TODOS
    if (roleTarget === "all") {
      io.to("admin").emit("new_notification", notification);
      io.to("users").emit("new_notification", notification);

      console.log("📡 enviada a admins y users");
    }

    // USER INDIVIDUAL
    if (userId) {
      io.to(`user_${userId}`).emit("new_notification", notification);

      console.log(`📡 enviada a user_${userId}`);
    }

    // PUSH
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
    console.log("❌ ERROR SEND NOTIFICATION");

    console.log(error);
  }
};

module.exports = sendNotification;
