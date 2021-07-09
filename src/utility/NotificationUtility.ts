/* Email */

/* Notifications */

/* Otp */
export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  return {otp, expiry};
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accountSid = 'ACa62d95519971da377f2a77d359e6e26a';
  const authToken = '191f36ea36cb77bc699d10a593fb9c08';

  const client = require('twilio')(accountSid, authToken);

  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: '+12052931171',
    to: `+94${toPhoneNumber}`,
  });

  return response;
};

/* Payment notification or emails */
