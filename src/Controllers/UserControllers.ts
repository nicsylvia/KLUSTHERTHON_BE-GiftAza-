import { NextFunction, Request, Response } from "express";
import UserModels from "../Models/UserModels";
import { AsyncHandler } from "../Utils/AsyncHandler";
import bcrypt from "bcrypt";
import { AppError, HTTPCODES } from "../Utils/AppError";
import BusinessModels from "../Models/BusinessModels";
import HistoryModels from "../Models/HistoryModels";
import { uuid } from "uuidv4";
import mongoose from "mongoose";
import GiftCardModels from "../Models/GiftCardModels";
import crypto from "crypto";
import axios from "axios";
import { EnvironmentVariables } from "../Config/EnvironmentVariables";
import { verifyUserEmail, verifyUserEmailByAdmin } from "../Emails/Email";

// Users Registration:
export const UsersRegistration = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { name, email, companyName } = req.body;

    const findEmail = await UserModels.findOne({ email });
    const getBusiness = await BusinessModels.findOne({
      companyName: companyName,
    });

    if (findEmail) {
      next(
        new AppError({
          message: "User with this account already exists",
          httpcode: HTTPCODES.FORBIDDEN,
        })
      );
    }

    if (getBusiness?.companyName === companyName) {
      const Users = await UserModels.create({
        name,
        email,
        // phoneNumber: "234" + phoneNumber,
      });
      verifyUserEmail(Users);
      verifyUserEmailByAdmin(Users, getBusiness);
      return res.status(201).json({
        message: "Successfully created User",
        data: Users,
      });
    } else {
      next(
        new AppError({
          message: "Business does not exists",
          httpcode: HTTPCODES.FORBIDDEN,
        })
      );
    }
  }
);

// Users Login:
export const UsersLogin = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const CheckEmail = await UserModels.findOne({ email });

    if (!CheckEmail) {
      next(
        new AppError({
          message: "User not Found",
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

    if (CheckEmail && CheckPassword) {
      return res.status(200).json({
        message: "Login Successfull",
        data: CheckEmail,
      });
    }
  }
);

// Get a single User:
export const GetSingleUser = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const singleuser = await UserModels.findById(req.params.userID).populate({
      path: "companyGiftCards",
    });

    if (!singleuser) {
      next(
        new AppError({
          message: "User not found",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    return res.status(200).json({
      message: "Successfully got this single user",
      data: singleuser,
    });
  }
);

// User wants to buy a business gift card using Kora's APIs to make Payment with ATM card - // User wants to buy a business gift card using payment with their card:
// export const UserBuyAGiftCardWithATMcard = AsyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
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

//     const GenerateTransactionReference = uuid();

//     // To get both single user and business
//     const user = await UserModels.findById(req.params.userID);
//     const Business = await BusinessModels.findById(req.params.businessID);
//     const giftcard = await GiftCardModels.findById(req.params.giftcardID);

//     if (!user && !Business && !giftcard) {
//       next(
//         new AppError({
//           message: "Invalid Account, Does not exist",
//           httpcode: HTTPCODES.NOT_FOUND,
//         })
//       );
//     }

//     // If no gift card from this business:
//     if (!Business?.giftCard) {
//       next(
//         new AppError({
//           message: `${Business?.companyName} does not have a gift card yet`,
//           httpcode: HTTPCODES.NOT_FOUND,
//         })
//       );
//     }

//     if (user && Business && giftcard) {
//       // For user to make the payment from their bank to business wallet:
//       const paymentData = {
//         reference: GenerateTransactionReference,
//         card: {
//           name,
//           number,
//           cvv,
//           pin,
//           expiry_year,
//           expiry_month,
//         },
//         amount,
//         currency: "NGN",
//         redirect_url: "https://merchant-redirect-url.com",
//         customer: {
//           name: user?.name,
//           email: user?.email,
//         },
//         metadata: {
//           internalRef: "JD-12-67",
//           age: 15,
//           fixed: true,
//         },
//       };

//           // To generate a receipt for the business and a notification
//           const BusinesstransactionHistory = await HistoryModels.create({
//             owner: Business?.companyName,
//             message: `${user?.name} bought a gift card from your store with money worth of ${amount}`,
//             transactionReference: GenerateTransactionReference,
//             transactionType: "Credit",
//           });

//           Business?.TransactionHistory?.push(
//             new mongoose.Types.ObjectId(BusinesstransactionHistory?._id)
//           );
//           Business.save();

//           // To update the history of the user with his/her debit alert of buying a gift card
//           const UserTransactionHistory = await HistoryModels.create({
//             owner: user?.name,
//             message: `You bought a gift card worth ${amount} from ${Business?.companyName}`,
//             transactionReference: GenerateTransactionReference,
//             transactionType: "Debit",
//           });

//           user?.TransactionHistory?.push(
//             new mongoose.Types.ObjectId(UserTransactionHistory?._id)
//           );
//           user.save();

//           return res.status(HTTPCODES.OK).json({
//             message: `${user?.name} successfully made payments for ${Business?.companyName} gift cards`,
//             data: {
//               paymentInfo: UserTransactionHistory,
//             },
//           });
//         })
//         .catch(function (error) {
//           next(
//             new AppError({
//               message: "Transaction failed",
//               httpcode: HTTPCODES.BAD_GATEWAY,
//               name: "Network Error",
//             })
//           );
//         });
//     }
//   }
// );
