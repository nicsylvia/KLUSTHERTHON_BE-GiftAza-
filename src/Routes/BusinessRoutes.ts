import express from "express";
import {
  BusinessLogin,
  BusinessRegistration,
  BusinessVerification,
  GetSingleBusinessAcount,
  GetSingleBusinessCards,
  UpdateBusinessLogo,
  VerifiedUserFinally,
} from "../Controllers/BusinessControllers";

import { BusinessLogo } from "../Config/Multer";

const BusinessRouter = express.Router();

BusinessRouter.route("/registerbusiness").post(BusinessRegistration);
BusinessRouter.route("/verifybusiness").post(BusinessVerification);
BusinessRouter.route("/loginbusiness").post(BusinessLogin);
BusinessRouter.route("/getsinglebusiness/:businessID").get(
  GetSingleBusinessAcount
);
BusinessRouter.route("/getsinglebusiness/:businessID/cards").get(
  GetSingleBusinessCards
);
BusinessRouter.route("/updatebusinesslogo/:id").patch(
  BusinessLogo,
  UpdateBusinessLogo
);
BusinessRouter.route("/final-verification/:UserId").post(VerifiedUserFinally);

export default BusinessRouter;
