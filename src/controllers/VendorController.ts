import {GenerateSignature} from './../utility/PasswordUtility';
import {FindVendor} from './AdminController';
import {VendorLoginInputs, EditVendorInputs, CreateFoodInputs} from './../dto';
import {Request, Response, NextFunction} from 'express';
import {ValidatePassword} from '../utility';
import {Food} from '../models';

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {email, password} = <VendorLoginInputs>req.body;
  const isExistsVendor = await FindVendor('', email);
  if (isExistsVendor !== null) {
    const validation = await ValidatePassword(
      password,
      isExistsVendor.password,
      isExistsVendor.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: isExistsVendor.id,
        email: isExistsVendor.email,
        name: isExistsVendor.name,
        foodTypes: isExistsVendor.foodType,
      });
      return res.json(signature);
    } else {
      return res.json({message: 'Password is invalid'});
    }
  }

  return res.json({message: 'Provided credentials invalid'});
};

export const GetVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existsVendor = await FindVendor(user._id);
    return res.json(existsVendor);
  }

  return res.json({message: "Vendor's profile not found"});
};

export const UpdateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {address, foodTypes, name, phone} = <EditVendorInputs>req.body;
  const user = req.user;

  if (user) {
    const existsVendor = await FindVendor(user._id);
    if (existsVendor !== null) {
      existsVendor.name = name;
      existsVendor.address = address;
      existsVendor.phone = phone;
      existsVendor.foodType = foodTypes;
      const savedResult = await existsVendor.save();
      return res.json(savedResult);
    }

    return res.json(existsVendor);
  }

  return res.json({message: "Vendor's profile not found"});
};


export const UpdateVendorCoverProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
 
  const user = req.user;

  if (user) {
  
    const vendor = await FindVendor(user._id);

    if (vendor !== null) {
      
      const files = req.files as [Express.Multer.File]
      const images = files.map((file: Express.Multer.File) => file.filename)
      
      vendor.coverImages.push(...images)
      const result = await vendor.save();

      return res.json(result);
    }
 
  }
};

export const UpdateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existsVendor = await FindVendor(user._id);
    if (existsVendor !== null) {
      existsVendor.serviceAvailable = !existsVendor.serviceAvailable;
      const savedResult = await existsVendor.save();
      return res.json(savedResult);
    }

    return res.json(existsVendor);
  }

  return res.json({message: "Vendor's profile not found"});
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const {name, description, category, foodType, price, readyTime} = <CreateFoodInputs>req.body;

    const vendor = await FindVendor(user._id);

    if (vendor !== null) {
      
      const files = req.files as [Express.Multer.File]
      const images = files.map((file:Express.Multer.File)=> file.filename)
      
      const createFood = await Food.create({
        vendorId: vendor._id,
        name: name,
        description: description,
        category: category,
        foodType: foodType,
        readyTime: readyTime,
        price: price,
        rating: 0,
        images: images,
      });

      vendor.foods.push(createFood);
      const result = await vendor.save();

      return res.json(result);
    }
  }

  return res.json({message: 'Something went wrong with add food'});
};

export const GetFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const foods = await Food.find({vendorId: user._id});

    if (foods !== null) {
      return res.json(foods);
    }
  }

  return res.json({message: 'something went wrong with get foods'});
};
