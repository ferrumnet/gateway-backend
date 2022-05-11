'use strict';

var mongoose = require('mongoose');

var CurrenciesModel = function () {
  var schema = mongoose.Schema({
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    createdByOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
    currencyAddressesByNetwork: [{ type: mongoose.Schema.Types.ObjectId, ref: 'currencyAddressesByNetwork'}],
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    symbol: { type: String, default: "" },
    logo: { type: String, default: "" },
    totalSupply: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'currencies' });

  return mongoose.model('currencies', schema);
};

module.exports = new CurrenciesModel();
