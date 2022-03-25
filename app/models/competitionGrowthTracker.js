"use strict";

var mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
       competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competitions', required: true },
       tokenContractAddress:{ type: String },
       tokenHolderAddress: { type: String, default: '' },//xyz
       tokenHolderQuantity:{type: String, default: ''},
       growth: {type:String, default:'0'},// review growth
       rank: {type:Number, default:null}// calculate
    }, { collection: 'competitionGrowthTracker'}
  // {
  //   competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competitions', required: true  },
  //   competitionType:{type:String},
  //   competitionDexLiquidityPoolCurrencyAddressByNetwork:{type:String},
  //   cabns: { type: String, required: true  },
  //   intitalBlock: { type: Number},//let 10 hint aprox bscscan has new block every 3 sec
  //   currentBlock: { type: Number},// next 50
  //   participants: [{// make it one to one
  //      CompetitionGrowthTracker:{},
  //      CABN:{},
  //      address: { type: String, default: null },//xyz
  //      startBalance:{type: String, default: null},
  //      growth: {type:String, default:null},// review growth
  //      rank: {type:Number, default:null}// calculate
  //   }],
  //   endDate: { type: Date, required : true },    
  // },
  // { collection: 'competitionGrowthTracker',
  //   timestamps: true,
  //  },
);

const CompetitionGrowthTracker = mongoose.model("CompetitionGrowthTracker", schema);
module.exports = CompetitionGrowthTracker;
