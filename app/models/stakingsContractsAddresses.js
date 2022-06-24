"use strict";

var mongoose = require("mongoose");

var StakingsContractsAddresses = function () {
  var stakingSchema = mongoose.Schema(
    {
      leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards'},
      stakingContractAddresses: [{ type: String, required: true }],
      currencyAddressByNetwork: { type: mongoose.Schema.Types.ObjectId, ref: "currencyAddressesByNetwork", required: true },
      isActive: { type: Boolean, default: false },
    },
    {timestamps: true, collection: "stakingsContractsAddresses", timestamps: true }
  );

  return mongoose.model("StakingsContractsAddresses", stakingSchema);
};

module.exports = new StakingsContractsAddresses();
