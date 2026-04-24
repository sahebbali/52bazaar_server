import express from "express";
import settingsController from "../../controllers/settingsController.js";
const router = express.Router();

// Settings routes
router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);
// router.post(
//   "/upload-logo",
//   upload.single("logo"),
//   settingsController.uploadLogo,
// );
router.post("/test-smtp", settingsController.testSMTP);
router.get("/payment-status", settingsController.getPaymentStatus);

export default router;
