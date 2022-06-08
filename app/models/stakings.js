"use strict";

var mongoose = require("mongoose");

var StakingModel = function () {
  var stakingSchema = mongoose.Schema(
    {
      tokenAddress: { type: Number },
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

  return mongoose.model("Stakings", stakingSchema);
};

module.exports = new StakingModel();
