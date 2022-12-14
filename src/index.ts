import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Database';
import { PORT } from './config';

const StartServer = async () => {
  const app = express();
  await dbConnection();

  await App(app);

  app.listen(PORT, () => {
    // console.clear()
    console.log(`App is listen to the heroku server port ${PORT}`);
  });
};


StartServer();