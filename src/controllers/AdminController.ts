import {GenerateSalt, GeneratePassword} from './../utility/PasswordUtility';
import {CreateVendorInput} from './../dto';
import {Request, Response, NextFunction} from 'express';
import {Vendor} from '../models';

export const FindVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({email: email});
  } else {
    return await Vendor.findById(id);
  }
};

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {name, address, pincode, foodType, email, password, ownerName, phone} =
    <CreateVendorInput>req.body;

  const existingVendor = await FindVendor('', email);

  if (existingVendor !== null) {
    return res.json({message: 'This vendor already exists for provided email'});
  }

  // Generate a salt
  const salt = await GenerateSalt();
  // Encrypt the password
  const saltedPassword = await GeneratePassword(password, salt);

  const createVendor = await Vendor.create({
    name: name,
    ownerName: ownerName,
    foodType: foodType,
    pincode: pincode,
    address: address,
    phone: phone,
    email: email,
    password: saltedPassword,
    salt: salt,
    serviceAvailable: false,
    coverImages: [],
    rating: 0,
    foods: [],
  });

  return res.json(createVendor);
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();

  if (vendors !== null) {
    return res.json(vendors);
  }

  return res.json({message: 'Vendors not available yet'});
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendorId = req.params.id;
  const vendor = await FindVendor(vendorId);

  if (vendor !== null) {
    return res.json(vendor);
  }

  return res.json({message: 'Any corresponding vendor not found'});
};
