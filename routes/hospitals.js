const express = require("express");
const router = express.Router();
const controller = require("../controllers/hospitals");
const { getVacCenters } = require("../controllers/hospitals");
const { protect, authorize } = require("../middlewares/auth");
const appointmentRouter = require("./appointments");

router.use("/:hospitalId/appointments", appointmentRouter);
router.route("/vacCenters").get(getVacCenters);
router
  .route("/")
  .get(controller.getHospitals)
  .post(protect, authorize("admin"), controller.createHospital);

router
  .route("/:id")
  .get(controller.getHospital)
  .put(protect, authorize("admin"), controller.updateHospital)
  .delete(protect, authorize("admin"), controller.deleteHospital);

module.exports = router;
