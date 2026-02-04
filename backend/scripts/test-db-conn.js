const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing connection to:', process.env.MONGODB_CONNECTIONSTRING);

mongoose
  .connect(process.env.MONGODB_CONNECTIONSTRING)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILURE: Could not connect to MongoDB', err);
    process.exit(1);
  });

setTimeout(() => {
  console.log('TIMEOUT: Connection test timed out after 10s');
  process.exit(1);
}, 10000);
