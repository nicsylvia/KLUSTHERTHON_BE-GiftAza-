"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLoginValidation = exports.UserRegisterValidation = void 0;
const Validator_1 = require("../Validator");
const UserSchemaValidation_1 = require("./UserSchemaValidation");
const UserRegisterValidation = (req, res, next) => (0, Validator_1.validator)(UserSchemaValidation_1.UserSchemaValidation.Register, req.body, next);
exports.UserRegisterValidation = UserRegisterValidation;
const UserLoginValidation = (req, res, next) => (0, Validator_1.validator)(UserSchemaValidation_1.UserSchemaValidation.Login, req.body, next);
exports.UserLoginValidation = UserLoginValidation;
