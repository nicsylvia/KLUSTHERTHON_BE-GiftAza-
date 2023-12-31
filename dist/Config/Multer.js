"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessLogo = void 0;
const multer_1 = __importDefault(require("multer"));
const Storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "Uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const BusinessLogo = (0, multer_1.default)({
    storage: Storage,
}).single("logo");
exports.BusinessLogo = BusinessLogo;
