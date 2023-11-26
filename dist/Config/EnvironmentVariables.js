"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentVariables = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.EnvironmentVariables = {
    PORT: process.env.PORT,
    MONGODB_STRING: process.env.LIVE_URL,
    API_KEY: process.env.api_key,
    API_SECRET: process.env.api_secret,
    google_id: process.env.google_id,
    google_secret: process.env.google_secret,
    google_refreshToken: process.env.google_refreshToken,
    google_redirectToken: process.env.google_redirectToken,
    accessToken: process.env.accessToken,
    from: process.env.from,
    subject: process.env.subject,
    user: process.env.user,
    type: process.env.type,
};
