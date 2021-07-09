import mongoose from 'mongoose';
import {MONGO_URL} from '../config';

export default async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Mongo connected');
  } catch (error) {
      console.log(error);
  }
};
