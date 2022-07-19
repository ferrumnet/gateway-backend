"use strict";

var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    blockNumberRange: [{ type: String }],
    currentBlockNumber: {type:String, default:"0"},
    tokenContractAddress: { type: String, require:true },
    isActive:{ type: Boolean, default:false}
  },
  { 
    collection: 'competitionTransactionsSnapshotsMeta',
    timeStamp:true
   },
);

var competitionTransactionsSnapshotsMeta = mongoose.model("CompetitionTransactionsSnapshotsMeta", schema);
module.exports = competitionTransactionsSnapshotsMeta;
