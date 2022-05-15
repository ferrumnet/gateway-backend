"use strict";

var mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
       competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competitions', required: true },
       tokenContractAddress:{ type: String },
       tokenHolderAddress: { type: String, default: '' },
       tokenHolderQuantity:{type: String, default: ''},
       growth: {type:String, default: '0'},
       humanReadableGrowth: {type:String, default: "0"},
       levelUpAmount: {type:String, default: ""},
       rank: {type:Number, default: null},
       excludedWalletAddress:{type:Boolean, default: false}
    }, { collection: 'competitionGrowthTracker'}
);

const CompetitionGrowthTracker = mongoose.model("CompetitionGrowthTracker", schema);
module.exports = CompetitionGrowthTracker;