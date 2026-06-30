const router = require("express").Router();

const auth = require("../middleware/Authorization");

const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/NotificationsController");

// GET ALL
router.get("/", auth, getNotifications);

// MARK ONE READ
router.put("/:id/read", auth, markNotificationRead);

// MARK ALL READ
router.put("/read-all", auth, markAllNotificationsRead);

// DELETE
router.delete("/:id", auth, deleteNotification);

module.exports = router;
