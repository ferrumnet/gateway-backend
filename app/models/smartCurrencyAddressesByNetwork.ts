'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  network: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
  smartContract: { type: mongoose.Schema.Types.ObjectId, ref: 'smartContracts' },
  createdByOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
  smartContractAddress: { type: String, default: "" },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'smartCurrencyAddressesByNetwork' });

var currencyAddressesByNetworkModel = mongoose.model("smartCurrencyAddressesByNetwork",schema);
module.exports = currencyAddressesByNetworkModel;
