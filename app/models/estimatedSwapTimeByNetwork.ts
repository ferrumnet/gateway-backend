'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  network: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
  time : { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'estimatedSwapTimeByNetwork' });

var estimatedSwapTimeByNetworkModel = mongoose.model("estimatedSwapTimeByNetwork",schema);
module.exports = estimatedSwapTimeByNetworkModel;
