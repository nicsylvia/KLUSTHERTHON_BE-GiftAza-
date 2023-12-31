import mongoose, { model, Schema, Document } from "mongoose";
export interface WalletData {
  Owner: string;
  Balance: number;
  credit: number;
  debit: number;
}

interface MainWalletData extends WalletData, Document {}

const WalletSchema = new Schema<WalletData>(
  {
    Owner: {
      type: String,
    },
    Balance: {
      type: Number,
    },
    debit: {
      type: Number,
    },
    credit: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const WalletModels = model<MainWalletData>("Users-Wallets", WalletSchema);
export default WalletModels;
