'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  network: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
  currency: { type: mongoose.Schema.Types.ObjectId, ref: 'currencies' },
  networkDex: { type: mongoose.Schema.Types.ObjectId, ref: 'networkDexes' },
  createdByOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
  tokenContractAddress: { type: String, default: "" },
  isAllowedOnMultiSwap: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'currencyAddressesByNetwork' });

var currencyAddressesByNetworkModel = mongoose.model("currencyAddressesByNetwork",schema);
module.exports = currencyAddressesByNetworkModel;
