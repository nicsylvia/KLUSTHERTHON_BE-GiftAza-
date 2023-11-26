"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BusinessControllers_1 = require("../Controllers/BusinessControllers");
const Multer_1 = require("../Config/Multer");
const BusinessRouter = express_1.default.Router();
BusinessRouter.route("/registerbusiness").post(BusinessControllers_1.BusinessRegistration);
BusinessRouter.route("/loginbusiness").post(BusinessControllers_1.BusinessLogin);
BusinessRouter.route("/getsinglebusiness/:businessID").get(BusinessControllers_1.GetSingleBusinessAcount);
BusinessRouter.route("/getsinglebusiness/:businessID/cards").get(BusinessControllers_1.GetSingleBusinessCards);
BusinessRouter.route("/updatebusinesslogo/:id").patch(Multer_1.BusinessLogo, BusinessControllers_1.UpdateBusinessLogo);
BusinessRouter.route("/final-verification/:UserId").post(BusinessControllers_1.VerifiedUserFinally);
exports.default = BusinessRouter;
