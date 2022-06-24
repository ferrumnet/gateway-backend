"use strict";

var mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    stakingContract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stakingContracts",
      required: true,
    },
    leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards'},
    stakeHolderWalletAddress: { type: String, required: true},
    growthInUsd: { type: Number, default: "0" },
    levelUpAmountInUsd: { type: Number, default: "0" },
    rank: { type: Number, default: null },
    excludedWalletAddress: { type: Boolean, default: false },
  },
  { collection: "stakingLeaderboardGrowthTracker" }
);

const StakingLeaderboardGrowthTracker = mongoose.model(
  "stakingLeaderboardGrowthTracker",
  schema
);
module.exports = StakingLeaderboardGrowthTracker;
