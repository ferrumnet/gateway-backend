'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  network: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
  dex: { type: mongoose.Schema.Types.ObjectId, ref: 'decentralizedExchanges' },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'networkDexes' });

var networkDexesModel = mongoose.model("networkDexes",schema);
module.exports = networkDexesModel;
