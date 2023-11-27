import { NextFunction, Request, Response } from "express";
import { AsyncHandler } from "../Utils/AsyncHandler";
import bcrypt from "bcrypt";
import crypto from "crypto";
import otpgenerator from "otp-generator";
import { AppError, HTTPCODES } from "../Utils/AppError";
import BusinessModels from "../Models/BusinessModels";
import { uuid } from "uuidv4";
import axios from "axios";
import { addMinutes, isAfter } from "date-fns";
import { EnvironmentVariables } from "../Config/EnvironmentVariables";
import UserModels from "../Models/UserModels";

import { finalVerifyAdminEmail, finalVerifyUserEmail } from "../Emails/Email";
import cloudinary from "../Config/Cloudinary";
import {
  AccountVerificationEmail,
  BusinessLoginNotification,
} from "../Emails/Business/BusinessEmails";
import mongoose from "mongoose";
import WalletModels from "../Models/wallet.models";

// Users Registration:
export const BusinessRegistration = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { companyName, email, phoneNumber, password } = req.body;

    const findEmail = await BusinessModels.findOne({ email });

    const token = crypto.randomBytes(48).toString("hex");

    const OTP = otpgenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    const otpExpiryTimestamp = addMinutes(new Date(), 5);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const dater = Date.now();

    const num = 234;

    const GenerateAccountNumber = Math.floor(Math.random() * 10) + dater;
    if (findEmail) {
      next(
        new AppError({
          message: "Business with this account already exists",
          httpcode: HTTPCODES.FORBIDDEN,
        })
      );
    }

    const codename = companyName.slice(0, 3);

    const Business = await BusinessModels.create({
      companyName,
      email,
      OTP,
      OTPExpiry: otpExpiryTimestamp,
      token,
      password: hashedPassword,
      phoneNumber,
      accountNumber: GenerateAccountNumber,
      BusinessCode:
        codename +
        otpgenerator.generate(20, {
          upperCaseAlphabets: false,
          specialChars: false,
          digits: true,
          lowerCaseAlphabets: false,
        }),
      Balance: 0,
      status: "Business",
    });
    const userWallet = await WalletModels.create({
      _id: Business?._id,
      Owner: Business?.companyName,
      Balance: 1000,
      credit: 0,
      debit: 0,
    });

    Business?.wallet.push(new mongoose.Types.ObjectId(userWallet?._id));
    Business.save();
    AccountVerificationEmail(Business);
    return res.status(201).json({
      message: "Successfully created Business Account",
      data: Business,
    });
  }
);

export const BusinessVerification = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { OTP } = req.body;
    const getbusiness = await BusinessModels.findOne({ OTP });

    if (getbusiness) {
      const currentTimestamp = new Date();
      const otpExpiry = new Date(getbusiness.OTPExpiry);

      if (isAfter(currentTimestamp, otpExpiry)) {
        return next(
          new AppError({
            message: "OTP has expired",
            httpcode: HTTPCODES.BAD_REQUEST,
          })
        );
      }

      await BusinessModels.findByIdAndUpdate(
        getbusiness?._id,
        {
          OTP: "empty",
          isVerified: true,
        },
        { new: true }
      );
      AccountVerificationEmail(getbusiness);
      return res.status(HTTPCODES.OK).json({
        message: "Business Verification Successfull, proceed to Login",
      });
    } else {
      return next(
        new AppError({
          message: "Wrong OTP",
          httpcode: HTTPCODES.BAD_REQUEST,
        })
      );
    }
  }
);

// Business Login:
export const BusinessLogin = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const CheckEmail = await BusinessModels.findOne({ email });

    if (!CheckEmail) {
      next(
        new AppError({
          message: "Business Account not Found",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    const CheckPassword = await bcrypt.compare(password, CheckEmail!.password);

    if (!CheckPassword) {
      next(
        new AppError({
          message: "Email or password not correct",
          httpcode: HTTPCODES.CONFLICT,
        })
      );
    }

    if (!CheckEmail?.isVerified) {
      return next(
        new AppError({
          message: "User not Verified",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }
    const localTime = new Date();
    const GetDeviceName = req.get("User-Agent");
    const formattedDateTime = localTime.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    if (CheckEmail && CheckPassword) {
      BusinessLoginNotification(CheckEmail, GetDeviceName, formattedDateTime);
      return res.status(200).json({
        message: "Login Successfull",
        data: CheckEmail,
      });
    }
  }
);

// Get single Business Account:
export const GetSingleBusinessAcount = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const SingleBusiness = await BusinessModels.findById(req.params.businessID);

    if (!SingleBusiness) {
      next(
        new AppError({
          message: "Business Account not found",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    return res.status(200).json({
      message: "Successfully got this business account",
      data: SingleBusiness,
    });
  }
);

// Get single Business Account:
export const GetSingleBusinessCards = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const SingleBusiness = await BusinessModels.findById(req.params.businessID);

    if (!SingleBusiness) {
      next(
        new AppError({
          message: "Business Account not found",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    const cards = await BusinessModels.findById(req.params.businessID).populate(
      {
        path: "giftCard",
        options: {
          sort: { createdAt: -1 },
        },
      }
    );

    return res.status(200).json({
      message: "Successfully got this business account",
      data: cards!.giftCard,
    });
  }
);

// Update Business Details:
export const UpdateBusinessLogo = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    // const { logo } = req.body;

    const CloudImg = await cloudinary.uploader?.upload(req?.file!.path);

    const BusinessLogo = await BusinessModels.findByIdAndUpdate(
      req.params.id,
      { logo: CloudImg.secure_url },
      { new: true }
    );

    if (!BusinessLogo) {
      next(
        new AppError({
          message: "An error occured in updating business logo",
          httpcode: HTTPCODES.INTERNAL_SERVER_ERROR,
        })
      );
    }

    return res.status(201).json({
      message: "Successfully updated the business brand logo",
      data: BusinessLogo,
    });
  }
);

export const VerifiedUserFinally = async (req: Request, res: Response) => {
  try {
    const { response } = req.body;

    const getUser = await UserModels.findById(req.params.UserId);
    const company = await BusinessModels.findOne({
      name: getUser?.companyName!,
    });

    if (response === "Yes") {
      if (getUser) {
        await UserModels.findByIdAndUpdate(
          req.params.UserId,
          {
            token: otpgenerator.generate(4, {
              upperCaseAlphabets: false,
              specialChars: false,
              digits: true,
              lowerCaseAlphabets: false,
            }),
          },
          { new: true }
        );

        finalVerifyAdminEmail(getUser, company);

        finalVerifyUserEmail(getUser);

        res.status(201).json({ message: "Sent..." });
        res.end();
      } else {
        return res.status(404).json({
          message: "user doesn't exist",
        });
      }
    } else if (response === "No") {
      if (getUser) {
        const getUser = await UserModels.findById(req.params.UserId);

        const name = getUser?.companyName;
        const company = await BusinessModels.findOne({ name });

        await UserModels.findByIdAndDelete(req.params.UserId);
        return res.status(201).json({ message: "user request not accepted" });
      }
    } else {
      return res.json({ message: "You can't be accepted" });
    }

    res.end();
  } catch (err) {
    return;
  }
};

// Business Transfer the funds they have in their business account to their bank:
// export const CheckOutToBank = AsyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     // Get the business details wanting to transfer the money:
//     const Business = await BusinessModels.findById(req.params.businessID);

//     const newDate = new Date().toDateString();

//     const TransferReference = uuid();

//     const {
//       amount,
//       name,
//       number,
//       cvv,
//       pin,
//       expiry_year,
//       expiry_month,
//       title,
//       description,
//     } = req.body;

//     if (amount > Business!.Balance) {
//       return res.status(HTTPCODES.FORBIDDEN).json({
//         message: "Insufficient Funds",
//       });
//     } else {
//       let data = JSON.stringify({
//         reference: TransferReference,
//         destination: {
//           type: "bank_account",
//           amount: `${amount}`,
//           currency: "NGN",
//           narration: "Test Transfer Payment",
//           bank_account: {
//             bank: "033",
//             account: "0000000000",
//           },
//           customer: {
//             name: Business?.companyName,
//             email: Business?.email,
//           },
//         },
//       });

//       var config = {
//         method: "post",
//         maxBodyLength: Infinity,
//         url: "https://api.korapay.com/merchant/api/v1/transactions/disburse",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${secret}`,
//         },
//         data: data,
//       };

//       axios(config)
//         .then(async function (response) {
//           // To update the balance of the business with the amount the business withdrawed
//           await BusinessModels.findByIdAndUpdate(Business?._id, {
//             Balance: Business!.Balance - amount,
//             dateTime: newDate,
//           });
//           // To generate a receipt for the business and a notification
//           const BusinessWithdrawalHistory = await HistoryModels.create({
//             owner: Business?.companyName,
//             message: `Dear ${Business?.companyName}, a withdrawal of ${amount} was made from your account and your balance is ${Business?.Balance}`,
//             transactionReference: TransferReference,
//             transactionType: "Debit",
//             dateTime: newDate,
//           });

//           Business?.TransactionHistory?.push(
//             new mongoose.Types.ObjectId(BusinessWithdrawalHistory?._id)
//           );
//           Business?.save();

//           return res.status(201).json({
//             message: `${Business?.companyName} successfully withdrawed ${amount} from account`,
//             data: {
//               paymentInfo: BusinessWithdrawalHistory,
//               paymentData: JSON.parse(JSON.stringify(response.data)),
//             },
//           });
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     }
//   }
// );
