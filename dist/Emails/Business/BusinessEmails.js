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
exports.BusinessLoginNotification = exports.AccountVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const googleapis_1 = require("googleapis");
const EnvironmentVariables_1 = require("../../Config/EnvironmentVariables");
const clientId = EnvironmentVariables_1.EnvironmentVariables.google_id;
const clientSecret = EnvironmentVariables_1.EnvironmentVariables.google_secret;
const refreshToken = "1//04GUtuw7JeuxYCgYIARAAGAQSNwF-L9IroTMvzhkr6oNRxm63Cima8oRzQU4tIsivTj9EPBmDL9qUatQODhDhkP0qbP4qut3HUdE";
const GOOGLE_REDIRECT = EnvironmentVariables_1.EnvironmentVariables.google_redirectToken;
const oAuth = new googleapis_1.google.auth.OAuth2(clientId, clientSecret, GOOGLE_REDIRECT);
oAuth.setCredentials({ refresh_token: refreshToken });
// Verify account/email by taking OTP from email
const AccountVerificationEmail = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = (yield oAuth.getAccessToken()).token;
    const transport = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: EnvironmentVariables_1.EnvironmentVariables.user,
            clientId,
            clientSecret,
            refreshToken,
            accessToken,
        },
    });
    const loadFile = path_1.default.join(__dirname, "../../Views/Business/BusinessSignup.ejs");
    const ReadUserData = yield ejs_1.default.renderFile(loadFile, {
        name: user.name,
        email: user.email,
        OTP: user.OTP,
    });
    const mailOptions = {
        from: EnvironmentVariables_1.EnvironmentVariables.from,
        to: user === null || user === void 0 ? void 0 : user.email,
        subject: "Welcome to Gift Aza - Your Path to Financial Success",
        html: ReadUserData,
    };
    transport
        .sendMail(mailOptions)
        .then(() => {
        console.log("Verification Email Sent..");
    })
        .catch((err) => {
        console.log("An error occured in sending welcome email", err);
    });
});
exports.AccountVerificationEmail = AccountVerificationEmail;
// Login notification email:
const BusinessLoginNotification = (user, deviceName, loginTimestamp) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = (yield oAuth.getAccessToken()).token;
    const transport = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: EnvironmentVariables_1.EnvironmentVariables.user,
            clientId,
            clientSecret,
            refreshToken,
            accessToken,
        },
    });
    const loadFile = path_1.default.join(__dirname, "../../Views/Business/LoginNotification.ejs");
    const ReadUserData = yield ejs_1.default.renderFile(loadFile, {
        name: user.name,
        devicename: deviceName,
        logintime: loginTimestamp,
    });
    const mailOptions = {
        from: EnvironmentVariables_1.EnvironmentVariables.from,
        to: user === null || user === void 0 ? void 0 : user.email,
        subject: "You Logged In",
        html: ReadUserData,
    };
    transport
        .sendMail(mailOptions)
        .then(() => {
        console.log("Login Notification..");
    })
        .catch((err) => {
        console.log("An error occured in sending login notification email", err);
    });
});
exports.BusinessLoginNotification = BusinessLoginNotification;
