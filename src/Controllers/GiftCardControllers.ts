import { NextFunction, Request, Response } from "express";
import { AsyncHandler } from "../Utils/AsyncHandler";
import Cloud from "../Config/cloudinary";
import { AppError, HTTPCODES } from "../Utils/AppError";
import GiftCardModels from "../Models/GiftCardModels";
import BusinessModels from "../Models/BusinessModels";
import mongoose from "mongoose";
import UserModels from "../Models/UserModels";

// Create a gift card:
export const GenerateAGiftCard = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { moneyWorth, colour } = req.body;

    const GetBusiness = await BusinessModels.findById(req.params.businessID);

    const ALLUSER = await UserModels.findById(req.params.userID);

    if (!GetBusiness) {
      next(
        new AppError({
          message: "Business Account not found",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    if (!GetBusiness?.logo) {
      next(
        new AppError({
          message:
            "Please upload a logo for your business first before generating a gift card",
          httpcode: HTTPCODES.SERVICE_UNAVAILABLE,
        })
      );
    }

    if (GetBusiness?.logo) {
      const GiftCard = await GiftCardModels.create({
        name: GetBusiness?.companyName,
        BrandLogo: GetBusiness?.logo,
        uniqueID: GetBusiness?.BusinessCode,
        colour,
        moneyWorth,
      });

      await ALLUSER?.companyGiftCards.push(
        new mongoose.Types.ObjectId(GiftCard?._id)
      );
      await ALLUSER?.save();

      await GetBusiness?.giftCard?.push(
        new mongoose.Types.ObjectId(GiftCard?._id)
      );
      GetBusiness?.save();

      return res.status(200).json({
        message: `A Gift card for ${GetBusiness?.companyName} with money worth of ${moneyWorth} successfully generated`,
        data: GiftCard,
      });
    }
  }
);

// Get all gift card in the database:
export const AllGiftCards = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const Giftcards = await GiftCardModels.find().sort({ createdAt: -1 });

    if (!Giftcards) {
      next(
        new AppError({
          message: "Couldn't get all gift cards",
          httpcode: HTTPCODES.INTERNAL_SERVER_ERROR,
        })
      );
    }

    return res.status(200).json({
      message: `Successfully got all ${Giftcards.length} gift cards`,
      data: Giftcards,
    });
  }
);

// Get all gift card for a particular business:
export const BusinessGiftCard = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const Business = await BusinessModels.findById(req.params.businessID)
      .populate({
        path: "giftCard",
      })
      .sort({ createdAt: -1 });

    if (!Business) {
      next(
        new AppError({
          message: `This business does not exist, \n Sign up to create an account \n Couldn't get this business gift cards`,
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    } else {
      return res.status(200).json({
        message: `Successfully got all ${Business?.giftCard.length} gift cards generated by ${Business?.companyName}`,
        data: Business,
      });
    }
  }
);

// Search for a gift card by amount and name:
export const SearchForGiftCard = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const giftcard = await GiftCardModels.findOne(req.query);

    if (!giftcard) {
      next(
        new AppError({
          message: "Gift card does not exist",
          httpcode: HTTPCODES.NOT_FOUND,
          name: "Unavailable",
        })
      );
    }

    return res.status(200).json({
      message: `Successfully got the searched gift card`,
      data: giftcard,
    });
  }
);