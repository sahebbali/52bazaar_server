import express from "express";
const router = express.Router();

import userController from "../../controllers/userController.js";

router.get("/get-profile", userController.getUserById);
router.put("/update-profile", userController.updateUser);
router.put("/update-password", userController.updatePassword);
router.delete("/delete-user-address", userController.deleteUserAddress);

export default router;
