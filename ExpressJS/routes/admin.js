const path = require('path');
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')
const isAuth = require('../middleware/is-auth')

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', isAuth, adminController.postAddProducts);
router.get('/products', isAuth, adminController.getAdminProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product/', isAuth, adminController.postEditProduct);
router.post('/delete-product/', isAuth, adminController.postDeleteProduct);

module.exports = router;