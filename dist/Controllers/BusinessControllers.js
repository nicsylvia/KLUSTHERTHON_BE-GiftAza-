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
exports.VerifiedUserFinally = exports.UpdateBusinessLogo = exports.GetSingleBusinessCards = exports.GetSingleBusinessAcount = exports.BusinessLogin = exports.BusinessVerification = exports.BusinessRegistration = void 0;
const AsyncHandler_1 = require("../Utils/AsyncHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const AppError_1 = require("../Utils/AppError");
const BusinessModels_1 = __importDefault(require("../Models/BusinessModels"));
const date_fns_1 = require("date-fns");
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const Email_1 = require("../Emails/Email");
const Cloudinary_1 = __importDefault(require("../Config/Cloudinary"));
const BusinessEmails_1 = require("../Emails/Business/BusinessEmails");
const mongoose_1 = __importDefault(require("mongoose"));
const wallet_models_1 = __importDefault(require("../Models/wallet.models"));
// Users Registration:
exports.BusinessRegistration = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyName, email, phoneNumber, password } = req.body;
    const findEmail = yield BusinessModels_1.default.findOne({ email });
    const token = crypto_1.default.randomBytes(48).toString("hex");
    const OTP = otp_generator_1.default.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
    });
    const otpExpiryTimestamp = (0, date_fns_1.addMinutes)(new Date(), 5);
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    const dater = Date.now();
    const num = 234;
    const GenerateAccountNumber = Math.floor(Math.random() * 10) + dater;
    if (findEmail) {
        next(new AppError_1.AppError({
            message: "Business with this account already exists",
            httpcode: AppError_1.HTTPCODES.FORBIDDEN,
        }));
    }
    const codename = companyName.slice(0, 3);
    const Business = yield BusinessModels_1.default.create({
        companyName,
        email,
        OTP,
        OTPExpiry: otpExpiryTimestamp,
        token,
        password: hashedPassword,
        phoneNumber,
        accountNumber: GenerateAccountNumber,
        BusinessCode: codename +
            otp_generator_1.default.generate(20, {
                upperCaseAlphabets: false,
                specialChars: false,
                digits: true,
                lowerCaseAlphabets: false,
            }),
        Balance: 0,
        status: "Business",
    });
    const userWallet = yield wallet_models_1.default.create({
        _id: Business === null || Business === void 0 ? void 0 : Business._id,
        Owner: Business === null || Business === void 0 ? void 0 : Business.companyName,
        Balance: 1000,
        credit: 0,
        debit: 0,
    });
    Business === null || Business === void 0 ? void 0 : Business.wallet.push(new mongoose_1.default.Types.ObjectId(userWallet === null || userWallet === void 0 ? void 0 : userWallet._id));
    Business.save();
    (0, BusinessEmails_1.AccountVerificationEmail)(Business);
    return res.status(201).json({
        message: "Successfully created Business Account",
        data: Business,
    });
}));
exports.BusinessVerification = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { OTP } = req.body;
    const getbusiness = yield BusinessModels_1.default.findOne({ OTP });
    if (getbusiness) {
        const currentTimestamp = new Date();
        const otpExpiry = new Date(getbusiness.OTPExpiry);
        if ((0, date_fns_1.isAfter)(currentTimestamp, otpExpiry)) {
            return next(new AppError_1.AppError({
                message: "OTP has expired",
                httpcode: AppError_1.HTTPCODES.BAD_REQUEST,
            }));
        }
        yield BusinessModels_1.default.findByIdAndUpdate(getbusiness === null || getbusiness === void 0 ? void 0 : getbusiness._id, {
            OTP: "empty",
            isVerified: true,
        }, { new: true });
        (0, BusinessEmails_1.AccountVerificationEmail)(getbusiness);
        return res.status(AppError_1.HTTPCODES.OK).json({
            message: "Business Verification Successfull, proceed to Login",
        });
    }
    else {
        return next(new AppError_1.AppError({
            message: "Wrong OTP",
            httpcode: AppError_1.HTTPCODES.BAD_REQUEST,
        }));
    }
}));
// Business Login:
exports.BusinessLogin = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const CheckEmail = yield BusinessModels_1.default.findOne({ email });
    if (!CheckEmail) {
        next(new AppError_1.AppError({
            message: "Business Account not Found",
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
    if (!(CheckEmail === null || CheckEmail === void 0 ? void 0 : CheckEmail.isVerified)) {
        return next(new AppError_1.AppError({
            message: "User not Verified",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
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
        (0, BusinessEmails_1.BusinessLoginNotification)(CheckEmail, GetDeviceName, formattedDateTime);
        return res.status(200).json({
            message: "Login Successfull",
            data: CheckEmail,
        });
    }
}));
// Get single Business Account:
exports.GetSingleBusinessAcount = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const SingleBusiness = yield BusinessModels_1.default.findById(req.params.businessID);
    if (!SingleBusiness) {
        next(new AppError_1.AppError({
            message: "Business Account not found",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    return res.status(200).json({
        message: "Successfully got this business account",
        data: SingleBusiness,
    });
}));
// Get single Business Account:
exports.GetSingleBusinessCards = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const SingleBusiness = yield BusinessModels_1.default.findById(req.params.businessID).populate({
        path: "viewUser",
    });
    if (!SingleBusiness) {
        next(new AppError_1.AppError({
            message: "Business Account not found",
            httpcode: AppError_1.HTTPCODES.NOT_FOUND,
        }));
    }
    const cards = yield BusinessModels_1.default.findById(req.params.businessID).populate({
        path: "giftCard",
        options: {
            sort: { createdAt: -1 },
        },
    });
    return res.status(200).json({
        message: "Successfully got this business account",
        data: cards.giftCard,
    });
}));
// Update Business Details:
exports.UpdateBusinessLogo = (0, AsyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const { logo } = req.body;
    var _a;
    const CloudImg = yield ((_a = Cloudinary_1.default.uploader) === null || _a === void 0 ? void 0 : _a.upload(req === null || req === void 0 ? void 0 : req.file.path));
    const BusinessLogo = yield BusinessModels_1.default.findByIdAndUpdate(req.params.id, { logo: CloudImg.secure_url }, { new: true });
    if (!BusinessLogo) {
        next(new AppError_1.AppError({
            message: "An error occured in updating business logo",
            httpcode: AppError_1.HTTPCODES.INTERNAL_SERVER_ERROR,
        }));
    }
    return res.status(201).json({
        message: "Successfully updated the business brand logo",
        data: BusinessLogo,
    });
}));
const VerifiedUserFinally = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { response } = req.body;
        const getUser = yield UserModels_1.default.findById(req.params.UserId);
        const company = yield BusinessModels_1.default.findOne({
            name: getUser === null || getUser === void 0 ? void 0 : getUser.companyName,
        });
        if (response === "Yes") {
            if (getUser) {
                yield UserModels_1.default.findByIdAndUpdate(req.params.UserId, {
                    token: otp_generator_1.default.generate(4, {
                        upperCaseAlphabets: false,
                        specialChars: false,
                        digits: true,
                        lowerCaseAlphabets: false,
                    }),
                }, { new: true });
                (0, Email_1.finalVerifyAdminEmail)(getUser, company);
                (0, Email_1.finalVerifyUserEmail)(getUser);
                res.status(201).json({ message: "Sent..." });
                res.end();
            }
            else {
                return res.status(404).json({
                    message: "user doesn't exist",
                });
            }
        }
        else if (response === "No") {
            if (getUser) {
                const getUser = yield UserModels_1.default.findById(req.params.UserId);
                const name = getUser === null || getUser === void 0 ? void 0 : getUser.companyName;
                const company = yield BusinessModels_1.default.findOne({ name });
                yield UserModels_1.default.findByIdAndDelete(req.params.UserId);
                return res.status(201).json({ message: "user request not accepted" });
            }
        }
        else {
            return res.json({ message: "You can't be accepted" });
        }
        res.end();
    }
    catch (err) {
        return;
    }
});
exports.VerifiedUserFinally = VerifiedUserFinally;
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
