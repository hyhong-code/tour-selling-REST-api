require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

mongoose
  .connect(process.env.MONGO_DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(console.log(`MongoDB connected`));

// Read file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')
);

// Import to db
const importData = async () => {
  try {
    await Tour.create(tours); // Can also accept array
    console.log('Data successfully imported');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

// Delete data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully destroyed');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
