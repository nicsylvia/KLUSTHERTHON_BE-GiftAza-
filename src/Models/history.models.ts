import mongoose, { model, Schema, Document } from "mongoose";
interface HistoryData {
  message: string;
  transactionReference: number;
  transactionType: string;
}

interface MainHistoryData extends HistoryData, Document {}

const HistorySchema = new Schema<HistoryData>(
  {
    message: {
      type: String,
    },
    transactionReference: {
      type: Number,
    },
    transactionType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const HistoryModels = model<MainHistoryData>("Histories", HistorySchema);

export default HistoryModels;
