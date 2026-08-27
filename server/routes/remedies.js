const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/remedyController');
const { protect } = require('../middleware/auth');

router.post('/order',       protect, createOrder);
router.get('/my-orders',    protect, getMyOrders);

module.exports = router;