"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    rpcUrl: { type: String, default: "" },
    fundManager: { type: String, default: "" },
    fiberRouter: { type: String, default: "" },
    router: { type: String, default: "" },
    foundryTokenAddress: { type: String, default: "" },
    forgeContractAddress: { type: String, default: "" },
    forgeFundManager: { type: String, default: "" },
    weth: { type: String, default: "" },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: "multiswapNetworkFIBERInformations" }
);

var multiswapNetworkFIBERInformationsModel = mongoose.model(
  "multiswapNetworkFIBERInformations",
  schema
);
module.exports = multiswapNetworkFIBERInformationsModel;
