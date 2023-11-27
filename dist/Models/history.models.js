"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HistorySchema = new mongoose_1.Schema({
    message: {
        type: String,
    },
    transactionReference: {
        type: Number,
    },
    transactionType: {
        type: String,
    },
}, {
    timestamps: true,
});
const HistoryModels = (0, mongoose_1.model)("Histories", HistorySchema);
exports.default = HistoryModels;
