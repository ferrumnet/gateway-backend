"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    walletAddress: { type: String, default: "" },
    type: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
  },
  { collection: "walletAddressWhiteList", timestamps: true }
);

var walletAddressWhiteListModel = mongoose.model("walletAddressWhiteList", schema);
module.exports = walletAddressWhiteListModel;
