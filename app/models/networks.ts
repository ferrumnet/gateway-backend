"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    name: { type: String, default: "" },
    nameInLower: { type: String, default: "" },
    networkShortName: { type: String, default: "" },
    ferrumNetworkIdentifier: { type: String, default: "" },
    chainId: { type: String, default: "" },
    networkId: { type: String, default: "" },
    rpcUrl: { type: String, default: "" },
    blockExplorerUrl: { type: String, default: "" },
    networkCurrencySymbol: { type: String, default: "" },
    dexInputCurrencySymbolList: [],
    networkCurrencyAddressByNetwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "currencyAddressesByNetwork",
    },
    isTestnet: { type: Boolean, default: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "networks" },
    isActive: { type: Boolean, default: true },
    isAllowedOnGateway: { type: Boolean, default: false },
    isAllowedOnMultiSwap: { type: Boolean, default: false },
    logo: { type: String, default: "" },
    publicRpcUrl: { type: String, default: "" },
    backupRpcUrl: { type: String, default: "" },
    positionForMultiSwap: { type: Number, default: 0 },
    multiSwapFiberRouterSmartContractAddress: { type: String, default: "" },
    multiswapNetworkFIBERInformation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "multiswapNetworkFIBERInformations",
    },
    isNonEVM: { type: Boolean, default: false },
    isAllowedDynamicGasValues: { type: Boolean, default: false },
    threshold: { type: Number, default: 0 },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: "networks" }
);

var networksModel = mongoose.model("networks", schema);
module.exports = networksModel;
