const express = require('express');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);
// http://127.0.0.1:3000/api/v1/bookings/checkout/webhook
router.post('/checkout/webhook', bookingController.stripeWebhookHandler);

router.get('/my-tours', authController.protect, bookingController.getMyTours);

module.exports = router;
