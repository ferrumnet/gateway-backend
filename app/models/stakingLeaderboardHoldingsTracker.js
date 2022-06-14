"use strict";

var mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    tokenContractAddress: { type: String },
    TokenUSDValue: { type: String, default: "0" },
    walletCurrentBalance: { type: String, default: "0" },
    stakedAmount: { type: Number, default: "0" },
  },
  {timestamps: true, collection: "stakingLeaderboardHoldingsTracker" }
);

const StakingLeaderboardHoldingsTracker = mongoose.model(
  "stakingLeaderboardHoldingsTracker",
  schema
);
module.exports = StakingLeaderboardHoldingsTracker;
