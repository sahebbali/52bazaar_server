import express from 'express';
const router = express.Router();
import categoryController from '../controllers/categoryController.js';
import multer from 'multer';
const upload = multer();

router.get('/categories', categoryController.getCategories);
router.post('/category/store', upload.none(), categoryController.addCategory);
router.put('/category/edit/:id', upload.none(), categoryController.updateCategory);
router.put('/category/edit/:id', upload.none(), categoryController.updateCategory);
router.post('/category/:id/deactivate', upload.none(), categoryController.deactivateCategory);


export default router;