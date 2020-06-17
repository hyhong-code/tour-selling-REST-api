require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

mongoose
  .connect(process.env.MONGO_DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(console.log(`MongoDB connected`));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server up on port ${PORT}`));