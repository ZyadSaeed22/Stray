require('dotenv').config();
const app       = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀  Server  →  http://localhost:${PORT}`);
    console.log(`🌍  Env     →  ${process.env.NODE_ENV}`);
  });
});