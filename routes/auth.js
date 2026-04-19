import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";

router.post("/admin/login", authController.login);
router.post("/login", authController.login);
router.put("/forget-password", authController.forgetPassword);

export default router;
