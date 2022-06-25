'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  stakingContractAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'stakingsContractsAddresses', require: true },
  leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards', require: true  },
  isActive: { type: Boolean, default: true },
},{timestamps: true ,collection: 'leaderboardStakingContractAddresses' });

var leaderboardStakingContractAddresses = mongoose.model("leaderboardStakingContractAddresses",schema);
module.exports = leaderboardStakingContractAddresses;
