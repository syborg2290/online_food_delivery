import {GenerateOtp, onRequestOTP} from './../utility/NotificationUtility';
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from './../utility/PasswordUtility';
import {validate} from 'class-validator';
import {
  CreateCustomerInputs,
  EditCustomerProfileInputs,
  UserLoginInputs,
} from './../dto';
import {Request, Response, NextFunction} from 'express';
import {plainToClass} from 'class-transformer';
import {Customer} from '../models';

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);

  const inputErrors = await validate(customerInputs, {
    validationError: {target: true},
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const {email, password, phone} = customerInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const {otp, expiry} = GenerateOtp();

  const isExistsCustomer = await Customer.findOne({email: email});
  if (isExistsCustomer !== null) {
    return res
      .status(409)
      .json({message: 'Already used email address, please use different one'});
  }

  const result = await Customer.create({
    email: email,
    password: userPassword,
    salt: salt,
    otp: otp,
    otp_Expire: expiry,
    firstname: '',
    lastname: '',
    address: '',
    phone: phone,
    verified: false,
    lat: 0,
    lng: 0,
  });

  if (result) {
    /* Send OTP to customer */
    await onRequestOTP(otp, phone);
    /* Generate the signature */
    const signature = GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });
    /* Send the result to client */
    return res.status(201).json({
      signature: signature,
      verified: result.verified,
      email: result.email,
    });
  }

  return res.status(400).json({message: 'Something went wrong!'});
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, {
    validationError: {target: false},
  });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }

  const {email, password} = loginInputs;

  const customer = await Customer.findOne({email: email});

  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });

      return res.status(201).json({
        signature: signature,
        verified: customer.verified,
        email: customer.email,
      });
    } else {
      return res.status(404).json({message: 'Unvalid password!'});
    }
  }

  return res
    .status(404)
    .json({message: 'Something went wrong in customer login!'});
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {otp} = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_Expire >= new Date()) {
        profile.verified = true;

        const updatedCustomerResponse = await profile.save();

        const signature = GenerateSignature({
          _id: updatedCustomerResponse._id,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });

        return res.status(201).json({
          signature: signature,
          verified: updatedCustomerResponse.verified,
          email: updatedCustomerResponse.email,
        });
      }
    }
  }

  return res
    .status(400)
    .json({message: 'Something went wrong in OTP verification!'});
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      const {otp, expiry} = GenerateOtp();
      profile.otp = otp;
      profile.otp_Expire = expiry;

      await profile.save();
      await onRequestOTP(otp, profile.phone);

      res
        .status(200)
        .json({message: 'OTP has been sent to registred phone number'});
    }
  }

  return res
    .status(400)
    .json({message: 'Something went wrong in requesting OTP!'});
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      return res.status(200).json(profile);
    }
  }

  return res.status(400).json({message: 'Something went wrong!'});
};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: {target: false},
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const {firstname, lastname, address} = profileInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstname = firstname;
      profile.lastname = lastname;
      profile.address = address;

      const result = await profile.save();
      res.status(200).json(result);
    }
  }

  return res.status(400).json({message: 'Something went wrong!'});
};
