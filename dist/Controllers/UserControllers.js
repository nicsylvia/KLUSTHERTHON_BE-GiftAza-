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
exports.FundWalletFromBank = exports.MakeTransfer = exports.GetSingleUser = exports.UsersLogin = exports.UsersRegistration = void 0;
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const AsyncHandler_1 = require("../Utils/AsyncHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppError_1 = require("../Utils/AppError");
const BusinessModels_1 = __importDefault(require("../Models/BusinessModels"));
const HistoryModels_1 = __importDefault(require("../Models/HistoryModels"));
const mongoose_1 = __importDefault(require("mongoose"));
const Email_1 = require("../Emails/Email");
const wallet_models_1 = __importDefault(require("../Models/wallet.models"));
// Users Registration:
exports.UsersRegistration = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, email, companyName } = req.body;
    const dater = Date.now();
    const num = 234;
    const GenerateAccountNumber = Math.floor(Math.random() * 10) + dater;
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
            accountNumber: GenerateAccountNumber,
            // phoneNumber: "234" + phoneNumber,
        });
        const userWallet = yield wallet_models_1.default.create({
            _id: Users === null || Users === void 0 ? void 0 : Users._id,
            Owner: Users === null || Users === void 0 ? void 0 : Users.name,
            Balance: 1000,
            credit: 0,
            debit: 0,
        });
        Users === null || Users === void 0 ? void 0 : Users.wallet.push(new mongoose_1.default.Types.ObjectId(userWallet === null || userWallet === void 0 ? void 0 : userWallet._id));
        (_a = getBusiness === null || getBusiness === void 0 ? void 0 : getBusiness.viewUser) === null || _a === void 0 ? void 0 : _a.push(new mongoose_1.default.Types.ObjectId(userWallet === null || userWallet === void 0 ? void 0 : userWallet._id));
        getBusiness === null || getBusiness === void 0 ? void 0 : getBusiness.save();
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
const MakeTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountNumber, amount } = req.body;
        const GenerateTransactionReference = Math.floor(Math.random() * 6745689743) + 243;
        // RECEIVER ACCOUNT:
        const getReciever = yield UserModels_1.default.findOne({ accountNumber });
        const getRecieverWallet = yield wallet_models_1.default.findById(getReciever === null || getReciever === void 0 ? void 0 : getReciever._id);
        // SENDER ACCOUNT:
        const getUser = yield UserModels_1.default.findById(req.params.userID);
        const getUserWallet = yield wallet_models_1.default.findById(req.params.walletID);
        if (getUser && getReciever) {
            if (amount > (getUserWallet === null || getUserWallet === void 0 ? void 0 : getUserWallet.Balance)) {
                return res.status(400).json({
                    message: "Insufficient Funds",
                });
            }
            else {
                // Avoid user sending my money to my account
                if ((getUser === null || getUser === void 0 ? void 0 : getUser.accountNumber) === accountNumber) {
                    return res.status(400).json({
                        message: "This is your account!!!...You can't transfer funds to yourself from this wallet",
                    });
                }
                else {
                    // Updating the sender wallet to receive the debit alert
                    yield wallet_models_1.default.findByIdAndUpdate(getUserWallet === null || getUserWallet === void 0 ? void 0 : getUserWallet._id, {
                        Balance: (getUserWallet === null || getUserWallet === void 0 ? void 0 : getUserWallet.Balance) - amount,
                        credit: 0,
                        debit: amount,
                    }
                    // to see the changes immediately
                    // {new: true}
                    );
                    // Create the receipt/history of your transaction:
                    const createSenderHistory = yield HistoryModels_1.default.create({
                        message: `You have sent ${amount} to ${getReciever.name}`,
                        transactionReference: GenerateTransactionReference,
                        transactionType: "Debit",
                    });
                    getUser.history.push(new mongoose_1.default.Types.ObjectId(createSenderHistory === null || createSenderHistory === void 0 ? void 0 : createSenderHistory._id));
                    getUser.save();
                    // Updating the receiver wallet to receive the credit alert:
                    yield wallet_models_1.default.findByIdAndUpdate(getRecieverWallet === null || getRecieverWallet === void 0 ? void 0 : getRecieverWallet._id, {
                        Balance: (getRecieverWallet === null || getRecieverWallet === void 0 ? void 0 : getRecieverWallet.Balance) + amount,
                        credit: amount,
                        debit: 0,
                    });
                    // Create the credit alert message for the receiver:
                    const createReceiverHistory = yield HistoryModels_1.default.create({
                        message: `An amount of ${amount} has been sent to you by ${getUser.name}`,
                        transactionReference: GenerateTransactionReference,
                        transactionType: "Credit",
                    });
                    getReciever.history.push(new mongoose_1.default.Types.ObjectId(createReceiverHistory === null || createReceiverHistory === void 0 ? void 0 : createReceiverHistory._id));
                    getReciever === null || getReciever === void 0 ? void 0 : getReciever.save();
                }
            }
            return res.status(200).json({
                messgae: "Transaction Successfull",
            });
        }
        else {
            return res.status(404).json({
                message: "Account not found",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "An error occured",
            data: error,
        });
    }
});
exports.MakeTransfer = MakeTransfer;
// Fund your wallet from your bank
const FundWalletFromBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const getUserBank = yield UserModels_1.default.findById(req.params.userID);
        const getUserWallet = yield wallet_models_1.default.findById(req.params.walletID);
        const { amount } = req.body;
        const transactionRef = (getUserBank === null || getUserBank === void 0 ? void 0 : getUserBank.name) + Math.floor(Math.random() * 2000273);
        yield wallet_models_1.default.findByIdAndUpdate(getUserWallet === null || getUserWallet === void 0 ? void 0 : getUserWallet._id, {
            Balance: (getUserWallet === null || getUserWallet === void 0 ? void 0 : getUserWallet.Balance) + amount,
        });
        // Get receipt for my transfer from bank to wallet
        const WalletCreditReceipt = yield HistoryModels_1.default.create({
            message: `An amount of ${amount} has been credited to your wallet from your bank`,
            transactionType: "Credit",
            transactionReference: transactionRef,
        });
        // Pushing in the receipt to the user
        (_b = getUserBank === null || getUserBank === void 0 ? void 0 : getUserBank.history) === null || _b === void 0 ? void 0 : _b.push(new mongoose_1.default.Types.ObjectId(WalletCreditReceipt === null || WalletCreditReceipt === void 0 ? void 0 : WalletCreditReceipt._id));
        return res.status(200).json({
            message: "Wallet credit successfuully",
            data: WalletCreditReceipt,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "An error occured",
            data: error,
        });
    }
});
exports.FundWalletFromBank = FundWalletFromBank;
