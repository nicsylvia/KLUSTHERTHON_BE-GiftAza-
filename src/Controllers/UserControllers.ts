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
import WalletModels from "../Models/wallet.models";

// Users Registration:
export const UsersRegistration = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { name, email, companyName } = req.body;

    const dater = Date.now();

    const num = 234;

    const GenerateAccountNumber = Math.floor(Math.random() * 10) + dater;
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
        accountNumber: GenerateAccountNumber,
        // phoneNumber: "234" + phoneNumber,
      });

      const userWallet = await WalletModels.create({
        _id: Users?._id,
        Owner: Users?.name,
        Balance: 1000,
        credit: 0,
        debit: 0,
      });

      Users?.wallet.push(new mongoose.Types.ObjectId(userWallet?._id));
      Users.save();
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

export const MakeTransfer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { accountNumber, amount } = req.body;

    const GenerateTransactionReference =
      Math.floor(Math.random() * 6745689743) + 243;

    // RECEIVER ACCOUNT:
    const getReciever = await UserModels.findOne({ accountNumber });

    const getRecieverWallet = await WalletModels.findById(getReciever?._id);

    // SENDER ACCOUNT:
    const getUser = await UserModels.findById(req.params.userID);
    const getUserWallet = await WalletModels.findById(req.params.walletID);

    if (getUser && getReciever) {
      if (amount > getUserWallet?.Balance!) {
        return res.status(400).json({
          message: "Insufficient Funds",
        });
      } else {
        // Avoid user sending my money to my account
        if (getUser?.accountNumber === accountNumber) {
          return res.status(400).json({
            message:
              "This is your account!!!...You can't transfer funds to yourself from this wallet",
          });
        } else {
          // Updating the sender wallet to receive the debit alert
          await WalletModels.findByIdAndUpdate(
            getUserWallet?._id,
            {
              Balance: getUserWallet?.Balance! - amount,
              credit: 0,
              debit: amount,
            }
            // to see the changes immediately
            // {new: true}
          );

          // Create the receipt/history of your transaction:
          const createSenderHistory = await HistoryModels.create({
            message: `You have sent ${amount} to ${getReciever.name}`,
            transactionReference: GenerateTransactionReference,
            transactionType: "Debit",
          });

          getUser.history.push(
            new mongoose.Types.ObjectId(createSenderHistory?._id)
          );
          getUser.save();

          // Updating the receiver wallet to receive the credit alert:
          await WalletModels.findByIdAndUpdate(getRecieverWallet?._id, {
            Balance: getRecieverWallet?.Balance + amount,
            credit: amount,
            debit: 0,
          });

          // Create the credit alert message for the receiver:
          const createReceiverHistory = await HistoryModels.create({
            message: `An amount of ${amount} has been sent to you by ${getUser.name}`,
            transactionReference: GenerateTransactionReference,
            transactionType: "Credit",
          });

          getReciever.history.push(
            new mongoose.Types.ObjectId(createReceiverHistory?._id)
          );
          getReciever?.save();
        }
      }
      return res.status(200).json({
        messgae: "Transaction Successfull",
      });
    } else {
      return res.status(404).json({
        message: "Account not found",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "An error occured",
      data: error,
    });
  }
};

// Fund your wallet from your bank

export const FundWalletFromBank = async (req: Request, res: Response) => {
  try {
    const getUserBank = await UserModels.findById(req.params.userID);

    const getUserWallet = await WalletModels.findById(req.params.walletID);

    const { amount } = req.body;

    const transactionRef =
      getUserBank?.name! + Math.floor(Math.random() * 2000273);

    await WalletModels.findByIdAndUpdate(getUserWallet?._id, {
      Balance: getUserWallet?.Balance + amount,
    });

    // Get receipt for my transfer from bank to wallet
    const WalletCreditReceipt = await HistoryModels.create({
      message: `An amount of ${amount} has been credited to your wallet from your bank`,
      transactionType: "Credit",
      transactionReference: transactionRef,
    });

    // Pushing in the receipt to the user
    getUserBank?.history?.push(
      new mongoose.Types.ObjectId(WalletCreditReceipt?._id)
    );

    return res.status(200).json({
      message: "Wallet credit successfuully",
      data: WalletCreditReceipt,
    });
  } catch (error) {
    return res.status(404).json({
      message: "An error occured",
      data: error,
    });
  }
};
