'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  sourceNetwork: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
  destinationNetwork: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
  time : { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'estimatedSwapTimeByNetwork' });

var estimatedSwapTimeByNetworkModel = mongoose.model("estimatedSwapTimeByNetwork",schema);
module.exports = estimatedSwapTimeByNetworkModel;
