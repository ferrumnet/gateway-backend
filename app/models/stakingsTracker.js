"use strict";

var mongoose = require("mongoose");

var StakingTrackerModel = function () {
  var stakingTrackerSchema = mongoose.Schema(
    {
      leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards'},
      user: { type: mongoose.Schema.Types.ObjectId, ref: "users"},
      stakingContractAddress: { type: String },
      tokenContractAddress: { type: String},
      stakeHolderWalletAddress: { type: String },
      intialBalance:{type: String},
      stakedAmount: { type:String },
      rewardAmount: { type:String },
      totalStakedAmount: { type:String },
      rank: { type: Number },
      levelUpAmount: { type: String },
    },
    {
      timestamps: true,
      collection: "stakingsTracker"
     }
  );

  return mongoose.model("StakingsTracker", stakingTrackerSchema);
};

module.exports = new StakingTrackerModel();


