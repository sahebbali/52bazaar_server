import express from 'express';
const router = express.Router();
import upload from "../middleware/upload.js";
import productController from '../controllers/productController.js';


router.get('/products', productController.getProducts);
router.post('/add-product', upload.single("product_image"), productController.addProduct);
router.put('/product/:id', upload.single("product_image"), productController.updateProduct);
router.post('/product/:id/deactivate', upload.none(), productController.deactivateProduct);

export default router;