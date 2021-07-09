import mongoose, {Schema, Document} from 'mongoose';

interface CustomerDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstname: string;
  lastname: string;
  address: string;
  phone: string;
  verified: boolean;
  otp: number;
  otp_Expire: Date;
  lat: number;
  lng: number;
}

const CustomerSchema = new Schema(
  {
    email: {type: String, required: true},
    password: {type: String, required: true},
    salt: {type: String, required: true},
    firstname: {type: String},
    lastname: {type: String},
    address: {type: String},
    phone: {type: String, required: true},
    verified: {type: Boolean, required: true},
    otp: {type: Number, required: true},
    otp_Expire: {type: Date, required: true},
    lat: {type: Number},
    lng: {type: Number},
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Customer = mongoose.model<CustomerDoc>('customer', CustomerSchema);

export {Customer};
