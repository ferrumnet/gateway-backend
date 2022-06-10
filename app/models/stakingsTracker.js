"use strict";

var mongoose = require("mongoose");

var StakingTrackerModel = function () {
  var stakingTrackerSchema = mongoose.Schema(
    {
      currencyAddressesByNetwork: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "currencyAddressesByNetwork",
      },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      stakingContractAddress: { type: String },
      tokenContractAddress: { type: String },
      stakeHolderWalletAddress: { type: String },
      walletBalance: { type: String }, // intialBalance
      stakedAmount: { type: String },
      rewardAmount: { type: String },
      stakingLeaderboardBalance: { type: String }, //totalStakedAmount
      rank: { type: Number },
      levelUpAmount: { type: String },
    },
    {
      timestamps: true,
      collection: "stakingsTracker",
    }
  );

  return mongoose.model("StakingsTracker", stakingTrackerSchema);
};

module.exports = new StakingTrackerModel();
