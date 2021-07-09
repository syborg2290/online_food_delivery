import {Request} from 'express';
import {APP_SECRET} from './../config/index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {AuthPayload, VendorPayload} from '../dto';

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  hashedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(enteredPassword, salt)) === hashedPassword;
};

export const GenerateSignature = (payload: AuthPayload) => {
  const signature = jwt.sign(payload, APP_SECRET, {expiresIn: '1d'});
  return signature;
};

export const ValidateSignature = async (req: Request) => {
  const signature = req.get('Authorization');
  if (signature) {
    const payload = (await jwt.verify(
      signature.split(' ')[1],
      APP_SECRET
    )) as AuthPayload;
    req.user = payload;
    return true;
  }
};
