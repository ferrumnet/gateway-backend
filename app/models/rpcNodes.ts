"use strict";

var mongoose = require("mongoose");
var collectionName = "rpcNodes";

var schema = mongoose.Schema(
  {
    url: { type: String, default: "" },
    chainId: { type: String, default: "" },
    address: { type: String, default: "" },
    type: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: collectionName }
);

var nodeConfigurationsModel = mongoose.model(collectionName, schema);
module.exports = nodeConfigurationsModel;
