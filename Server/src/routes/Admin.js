const router = require("express").Router();

const auth = require("../middleware/Authorization");
const adminMiddleware = require("../Middleware/isAdmin");  

const {
  getDashboardMetrics,
  getSalesCalendar,
  getSalesDay,
} = require("../controllers/AdminController");

router.get("/dashboard", auth, adminMiddleware, getDashboardMetrics);
router.get("/sales-calendar", auth, adminMiddleware, getSalesCalendar);
router.get("/sales-day", auth, adminMiddleware, getSalesDay);

module.exports = router;