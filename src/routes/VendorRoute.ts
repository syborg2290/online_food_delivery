import express, {Request, Response, NextFunction} from 'express';
import {
  AddFood,
  GetFoods,
  GetVendorProfile,
  UpdateVendorProfile,
  UpdateVendorService,
  VendorLogin,
  UpdateVendorCoverProfile,
} from '../controllers';
import {Authenticate} from '../middlewares';
import multer from 'multer';

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname
    );
  },
});

const images = multer({storage: imageStorage}).array('images', 10);

/* All routes */
router.post('/login', VendorLogin);

/* Authenthorized routes */
router.use(Authenticate);

router.get('/profile', GetVendorProfile);
router.patch('/profile', UpdateVendorProfile);
router.patch('/coverImages', images, UpdateVendorCoverProfile);
router.patch('/service', UpdateVendorService);
router.post('/food', images, AddFood);
router.get('/foods', GetFoods);

export {router as VendorRoute};
