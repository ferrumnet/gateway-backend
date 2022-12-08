"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    stakeId: { type: mongoose.Schema.Types.ObjectId, ref: "stakings" },
    walletAddress: { type: String, required: true },
    sign: { type: Boolean, default: true },
  },
  { timestamps: true }
);

var stakeSignAddressesModel = mongoose.model("StakeSignAddresses", schema);
module.exports = stakeSignAddressesModel;
