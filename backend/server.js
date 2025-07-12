const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/dotenv');

const PORT = config.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${config.NODE_ENV}]`);
  });
})();
