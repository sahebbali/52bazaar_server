import express from "express";
import inventoryController from "../../controllers/inventoryController.js";

const router = express.Router();

router.get("/get-all-inventory", inventoryController.getAllInventory);
router.get("/get-inventory/:id", inventoryController.getInventoryById);

export default router;
