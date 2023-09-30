"use strict";

var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    cabn: { type: String  },
    transferFee: { type: Number },
    unwrapFee: { type: Number },
    buyFee: { type: Number },
    sellFee: { type: Number },
    stakeFee: { type: Number },
    unstakeFee: { type: Number },
  },
  { 
    collection: 'crucibleFees',
   },
);

var crucibleFees = mongoose.model("crucibleFees", schema);
module.exports = crucibleFees;
