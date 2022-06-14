'use strict';

var mongoose = require('mongoose');

var LeaderboardStakingContractAddresses = function () {
  var schema = mongoose.Schema({
    stakingContractAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'stakingsContractsAddresses' },
    leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards' },
    isActive: { type: Boolean, default: true },
  },{timestamps: true ,collection: 'leaderboardStakingContractAddresses' });

  return mongoose.model('LeaderboardStakingContractAddresses', schema);
};

module.exports = new LeaderboardStakingContractAddresses();
