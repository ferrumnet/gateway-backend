'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  tokenSymbol: { type: String, default: "" },
  lifeTimeAPR:{
    APR: { type: Number, default: null },
    timeReference: { type: String, default: "" },
    totalStake: { type: String, default: "" },
    price: { type: String, default: "" },
    volumeOfRewardsDistributed: { type: Number, default: null }
  },
  dailyAPR:{
    APR: { type: Number, default: null },
    timeReference: { type: String, default: "" },
    totalStake: { type: String, default: "" },
    price: { type: String, default: "" },
    volumeOfRewardsDistributed: { type: Number, default: null },
    updatedAt: { type: Date, default: new Date() }
  },
  weeklyAPR:{
    APR: { type: Number, default: null },
    timeReference: { type: String, default: "" },
    totalStake: { type: String, default: "" },
    price: { type: String, default: "" },
    volumeOfRewardsDistributed: { type: Number, default: null },
    updatedAt: { type: Date, default: new Date() }
  },
  monthlyAPR:{
    APR: { type: Number, default: null },
    timeReference: { type: String, default: "" },
    totalStake: { type: String, default: "" },
    price: { type: String, default: "" },
    volumeOfRewardsDistributed: { type: Number, default: null },
    updatedAt: { type: Date, default: new Date() }
  },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
},{ collection: 'crucibleAprs' });

var crucibleAprsModel = mongoose.model("crucibleAprs",schema);
module.exports = crucibleAprsModel;
