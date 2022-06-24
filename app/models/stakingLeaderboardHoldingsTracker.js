"use strict";

var mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    stakingLeaderboardGrowthTracker:{ type: mongoose.Schema.Types.ObjectId, ref: "stakingLeaderboardGrowthTracker", required: true,},
    tokenContractAddress: { type: String, required: true},
    totalHoldingUSDValue: { type: Number, default: 0 },
    walletCurrentBalance: { type: String, default: "0" },
    stakedAmount: { type: Number, default: 0},
    rewardAmount: { type:Number, default: 0},
  },
  {timestamps: true, collection: "stakingLeaderboardHoldingsTracker" }
);

const StakingLeaderboardHoldingsTracker = mongoose.model(
  "stakingLeaderboardHoldingsTracker",
  schema
);
module.exports = StakingLeaderboardHoldingsTracker;
