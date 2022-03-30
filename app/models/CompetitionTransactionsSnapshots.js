"use strict";

var mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    blockNumber: { type: String  },
    timeStamp: { type: String },
    hash:{type: String},
    nonce:{type:String},
    blockHash:{type:String},
    from: { type: String },
    contractAddress: { type: String },
    to: { type: String},
    value: { type: String },
    tokenName: {type: String},
    tokenSymbol: {type: String},
    tokenDecimal:{type: String},
    transactionIndex:{type: String},
    gas: { type: String},
    gasPrice: { type: String},
    gasUsed: { type: String},
    cumulativeGasUsed: { type: String},
    input: { type: String},
    confirmations: { type: String}, 
    isError: { type: String },
    errCode: { type: String}, 
  },
  { 
    collection: 'competitionTransactionsSnapshots',
   },
);

const CompetitionTransactionsSnapshots = mongoose.model("CompetitionTransactionsSnapshots", schema);
module.exports = CompetitionTransactionsSnapshots;
