import express from "express";
import {
  GetSingleUser,
  UsersLogin,
  UsersRegistration,
} from "../Controllers/UserControllers";

const UserRouter = express.Router();

UserRouter.route("/registeruser").post(UsersRegistration);
UserRouter.route("/loginuser").post(UsersLogin);
UserRouter.route("/getsingleuser/:userID").get(GetSingleUser);
// UserRouter.route("/buyagiftcard/:userID/:businessID/:giftcardID").post(
//   UserBuyAGiftCardWithATMcard
// );

export default UserRouter;
