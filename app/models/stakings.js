"use strict";

var mongoose = require("mongoose");

var StakingModel = function () {
  var stakingSchema = mongoose.Schema(
    {
      tokenAddress: { type: Number },
      stakingCapital: { type: Number },
      stakingStarts: { type: Date, default: new Date() },
      stakingEnds: { type: Date, default: new Date() },
      withdrawStarts: { type: Date, default: new Date() },
      withdrawEnds: { type: Date, default: new Date() },
      appId: { type: String },
      encodedAddress: { type: String },
      createdAt: { type: Date, default: new Date() },
      updatedAt: { type: Date, default: new Date() },
      status: { type: String, default: "CREATED" },
      storageAppId: { type: String },
      rewardAmount: { type: Number },
      withdrawableAmount: { type: Number },
    },
    { collection: "stakings" }
  );

  return mongoose.model("Stakings", stakingSchema);
};

module.exports = new StakingModel();
