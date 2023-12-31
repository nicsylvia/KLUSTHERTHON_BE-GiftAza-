import mongoose, { Schema, model } from "mongoose";

import { BusinessDetails } from "../AllInterfaces/Interfaces";

import isEmail from "validator/lib/isEmail";

const BusinessSchema: Schema<BusinessDetails> = new Schema(
  {
    companyName: {
      type: String,
      // required: [true, "Please enter your name"],
      unique: true,
    },
    email: {
      type: String,
      // required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    token: {
      type: String,
      required: true,
    },
    OTP: {
      type: String,
      required: true,
    },
    OTPExpiry: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      // required: [true, "Please enter your Password"],
    },
    confirmPassword: {
      type: String,
      // required: [true, "Please confirm your password"],
    },
    BusinessCode: {
      type: String,
      unique: true,
    },
    Balance: {
      type: Number,
    },
    phoneNumber: {
      type: Number,
      unique: true,
    },
    accountNumber: {
      type: Number,
      unique: true,
    },
    dateTime: {
      type: String,
    },
    status: {
      type: String,
      required: [true, "Please enter your status"],
      message: "You must either be a User or for Business",
      enum: ["User", "Business"],
      default: "Business",
    },
    createUserProfile: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "createUserProfile",
      },
    ],
    giftCard: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GiftCards",
      },
    ],
    TransactionHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Histories",
      },
    ],
    history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin_Histories",
      },
    ],
    wallet: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin-Wallets",
      },
    ],
    viewUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ViewUsers",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const BusinessModels = model<BusinessDetails>("Businesses", BusinessSchema);

export default BusinessModels;
