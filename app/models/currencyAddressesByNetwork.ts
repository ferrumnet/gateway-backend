"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    network: { type: mongoose.Schema.Types.ObjectId, ref: "networks" },
    currency: { type: mongoose.Schema.Types.ObjectId, ref: "currencies" },
    networkDex: { type: mongoose.Schema.Types.ObjectId, ref: "networkDexes" },
    createdByOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
    },
    createdByusers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    tokenContractAddress: { type: String, default: "" },
    isAllowedOnMultiSwap: { type: Boolean, default: false },
    isFeeToken: { type: Boolean, default: false },
    isBaseFeeToken: { type: Boolean, default: false },
    baseFeeAmount: { type: Number, default: null },
    baseFeePercentage: { type: Number, default: null },
    positionForFeeToken: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isNonEVM: { type: Boolean, default: false },
    decimals: { type: Number, default: 0 },
    priority: { type: Number, default: 0 },
    isNative: { type: Boolean, default: false },
    oneInchAddress: { type: String, default: "" },
    isDefault: { type: Boolean, default: true },
    nonDefaultCurrencyInformation: {
      name: { type: String, default: "" },
      symbol: { type: String, default: "" },
    },
    isCreatedFromBulk: { type: Boolean, default: false },
    sourceSlippage: { type: Number, default: 2 },
    destinationSlippage: { type: Number, default: 2 },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: "currencyAddressesByNetwork" }
);

var currencyAddressesByNetworkModel = mongoose.model(
  "currencyAddressesByNetwork",
  schema
);
module.exports = currencyAddressesByNetworkModel;
