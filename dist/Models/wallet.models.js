"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WalletSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
const WalletModels = (0, mongoose_1.model)("Users-Wallets", WalletSchema);
exports.default = WalletModels;
