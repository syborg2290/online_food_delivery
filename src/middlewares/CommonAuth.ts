import {ValidateSignature} from './../utility';
import {Response, Request, NextFunction} from 'express';
import {AuthPayload} from '../dto';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validate = await ValidateSignature(req);

  if (validate) {
    next();
  } else {
    return res.json({message: 'Unauthorized access'});
  }
};
