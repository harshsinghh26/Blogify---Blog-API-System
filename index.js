import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './src/db/index.js';

dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`app is listening on PORT ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
