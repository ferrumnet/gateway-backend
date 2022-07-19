'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards' },
  dexLiquidityPoolCurrencyAddressByNetwork:{type:String, default:null},
  name: { type: String, default: "" },
  nameInLower: { type: String, default: ""},
  startDate: { type: Date, default: new Date() },
  endDate: { type: Date, default: new Date() },
  startDateAfterDelay: { type: Date, default: new Date() },
  endDateAfterDelay: { type: Date, default: new Date() },
  startBlock: { type: String, default: "" },
  currentBlock: { type: String, default: "" },
  endBlock: { type: String, default: "" },
  status: { type: String, default: "pending" },
  type: { type: String, enum :{values: ['purchaseFlow', 'purchaseAndSellFlow', 'balance','tradingVolumeFlow',''], message: 'Invalid type'}, default: "" },
  isActive: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations', required: true  },
  isVisibleForPublicMenuItem: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
},{ collection: 'competitions' });

var competitionsModel = mongoose.model("competitions",schema);
module.exports = competitionsModel;
