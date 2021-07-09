import express, {Application} from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import {AdminRoute, CustomerRoute, ShoppingRoute, VendorRoute} from '../routes';

export default async (app: Application) => {
  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5000, // limit each IP to 100 requests per windowMs
    message:
      "Too many requests created from this IP, please try again after an 5 minutes",
  });

  //  apply to all requests
  app.use(limiter);

  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  app.use('/images', express.static(path.join(__dirname, 'images')));

  // Main routes
  app.use('/admin', AdminRoute);
  app.use('/vendor', VendorRoute);
  app.use('/customer', CustomerRoute);
  app.use(ShoppingRoute);

  return app;
};
