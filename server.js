const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

process.on('uncaughtException', (error) => {
  console.log('UNCAUGHT EXCEPTION ! Shutting down...');
  console.log(error);
  process.exit(1);
});

const app = require('./app');

mongoose.connect(process.env.DATABASE).then((con) => {
  console.log('Db connection successful!');
});

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (error) => {
  console.log('UNHANDLED REJECTION ! Shutting down...');
  console.log(error);
  server.close(() => {
    process.exit(1);
  });
});

