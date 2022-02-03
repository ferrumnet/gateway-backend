'use strict';

var mongoose = require('mongoose');

var CurrencyAddressesByNetworkModel = function () {
  var schema = mongoose.Schema({
    network: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
    currency: { type: mongoose.Schema.Types.ObjectId, ref: 'currencies' },
    networkDex: { type: mongoose.Schema.Types.ObjectId, ref: 'networkDexes' },
    createdByOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
    tokenContractAddress: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'currencyAddressesByNetwork' });

  return mongoose.model('currencyAddressesByNetwork', schema);
};

module.exports = new CurrencyAddressesByNetworkModel();
