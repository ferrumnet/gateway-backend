"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards'},
    stakingContractAddresses: [{ type: String, required: true }],
    currencyAddressByNetwork: { type: mongoose.Schema.Types.ObjectId, ref: "currencyAddressesByNetwork", required: true },
    isActive: { type: Boolean, default: false },
  },
  {timestamps: true, collection: "stakingsContractsAddresses" }
);

var stakingsContractsAddresses = mongoose.model("stakingsContractsAddresses",schema);
module.exports = stakingsContractsAddresses;
