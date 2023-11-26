"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserControllers_1 = require("../Controllers/UserControllers");
const UserRouter = express_1.default.Router();
UserRouter.route("/registeruser").post(UserControllers_1.UsersRegistration);
UserRouter.route("/loginuser").post(UserControllers_1.UsersLogin);
UserRouter.route("/getsingleuser/:userID").get(UserControllers_1.GetSingleUser);
// UserRouter.route("/buyagiftcard/:userID/:businessID/:giftcardID").post(
//   UserBuyAGiftCardWithATMcard
// );
exports.default = UserRouter;
