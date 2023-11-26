"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSingleUser = exports.UsersLogin = exports.UsersRegistration = void 0;
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const AsyncHandler_1 = require("../Utils/AsyncHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppError_1 = require("../Utils/AppError");
const BusinessModels_1 = __importDefault(require("../Models/BusinessModels"));
const Email_1 = require("../Emails/Email");
// Users Registration:
exports.UsersRegistration = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, companyName } = req.body;
    const findEmail = yield UserModels_1.default.findOne({ email });
    const getBusiness = yield BusinessModels_1.default.findOne({
        companyName: companyName,
    });
    if (findEmail) {
        next(new AppError_1.AppError({
            message: "User with this account already exists",
            httpcode: AppError_1.HTTPCODES.FORBIDDEN,
        }));
    }
    if ((getBusiness === null || getBusiness === void 0 ? void 0 : getBusiness.companyName) === companyName) {
        const Users = yield UserModels_1.default.create({
            name,
            email,
            // phoneNumber: "234" + phoneNumber,
        });
        (0, Email_1.verifyUserEmail)(Users);
        (0, Email_1.verifyUserEmailByAdmin)(Users, getBusiness);
        return res.status(201).json({
            message: "Successfully created User",
            data: Users,
        });
    }
    else {
        next(new AppError_1.AppError({
            message: "Business does not exists",
            httpcode: AppError_1.HTTPCODES.FORBIDDEN,
        }));
    }
}));
// Users Login:
exports.UsersLogin = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const CheckEmail = yield UserModels_1.default.findOne({ email });
    if (!CheckEmail) {
        next(new AppError_1.AppError({
            message: "User not Found",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    const CheckPassword = yield bcrypt_1.default.compare(password, CheckEmail.password);
    if (!CheckPassword) {
        next(new AppError_1.AppError({
            message: "Email or password not correct",
            httpcode: AppError_1.HTTPCODES.CONFLICT,
        }));
    }
    if (CheckEmail && CheckPassword) {
        return res.status(200).json({
            message: "Login Successfull",
            data: CheckEmail,
        });
    }
}));
// Get a single User:
exports.GetSingleUser = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const singleuser = yield UserModels_1.default.findById(req.params.userID).populate({
        path: "companyGiftCards",
    });
    if (!singleuser) {
        next(new AppError_1.AppError({
            message: "User not found",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    return res.status(200).json({
        message: "Successfully got this single user",
        data: singleuser,
    });
}));
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
