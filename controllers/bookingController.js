const Stripe = require('stripe');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Tour = require('../model/tourModel');
const Booking = require('../model/bookingModel');

const STRIPE = new Stripe(process.env.STRIPE_API_KEY);
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;
const SERVER_URL = process.env.CLIENT_URL;

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('Tour not found !', 404));
  }

  // Create Booking
  const newBooking = new Booking({
    tour: tour.id,
    user: req.user.id,
    price: tour.price,
    paid: false,
  });
  await newBooking.save();

  // Create checkout session
  const sessionData = await STRIPE.checkout.sessions.create({
    mode: 'payment',
    metadata: {
      bookingId: newBooking._id.toString(),
    },
    success_url: `${CLIENT_URL}/payment/success`,
    cancel_url: `${CLIENT_URL}/payment/cancel?status=false`,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${SERVER_URL}/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100, // The price in cents
        },
        quantity: 1,
      },
    ],
  });

  if (!sessionData.url) {
    return next(new AppError('Error creating stripe session', 500));
  }

  res.status(200).json({
    status: 'success',
    sessionData,
  });
});

exports.stripeWebhookHandler = async (req, res, next) => {
  // console.log('Received event');
  // console.log('=============');
  // console.log('event: ', req.body);
  // res.send();
  let event;
  const sig = req.headers['stripe-signature'];
  try {
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log(error);
    res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const booking = await Booking.findById(
      event.data.object.metadata?.bookingId
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.paid = true;
    await booking.save();

    console.log(booking);
  }

  res.status(200).send();
};

exports.getMyTours = catchAsync(async (req, res, next) => {


  console.log(req.user.id);
  // Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // Find tours with the returned ids
  const tourIds = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  })
});
