const fs = require('fs');

const dotenv = require('dotenv').config({path: './../../.env'});
const mongoose = require('mongoose');

const Tour = require('./../../model/tourModel');
const Review = require('./../../model/reviewModel');
const User = require('./../../model/userModel');

mongoose
  .connect(process.env.DATABASE)
  .then((con) => {
    console.log('Db connection successful!');
  });

// Read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// Import data into db
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded');
    process.exit();
  } catch (error) {
    console.log(error);
  }
}

// Delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
    process.exit();
  } catch (error) {
    console.log(error);
  }
}

if(process.argv[2] === '--import') {
  importData();
} else if(process.argv[2] === '--delete') {
  deleteData();
}