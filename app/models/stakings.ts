"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    tokenAddress: { type: Number },
    rewardTokenAddress: { type: Number },
    stakingCapital: { type: Number },
    stakingStarts: { type: String },
    stakingEnds: { type: String },
    withdrawStarts: { type: String },
    withdrawEnds: { type: String },
    appId: { type: String },
    encodedAddress: { type: String },
    status: { type: String, default: "CREATED" },
    storageAppId: { type: String },
    rewardAmount: { type: Number },
    withdrawableAmount: { type: Number },
  },
  { collection: "stakings", timestamps: true }
);

var stakingModel = mongoose.model("stakings", schema);
module.exports = stakingModel;
