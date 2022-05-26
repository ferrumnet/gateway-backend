"use strict";

var mongoose = require("mongoose");

var StakingTrackerModel = function () {
  var stakingTrackerSchema = mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId},
      stakingContractAddress: { type: String },
      tokenContractAddress: { type: String},
      stakeHolderWalletAddress: { type: String },
      stakedAmount: { type:String },
      rewardAmount: { type:String },
    },
    {
      timestamps: true,
      collection: "StakingsTracker"
     }
  );

  return mongoose.model("StakingsTracker", stakingTrackerSchema);
};

module.exports = new StakingTrackerModel();


