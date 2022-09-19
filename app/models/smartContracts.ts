'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdByOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
  smartCurrencyAddressesByNetwork: [{ type: mongoose.Schema.Types.ObjectId, ref: 'smartCurrencyAddressesByNetwork'}],
  name: { type: String, default: "" },
  nameInLower: { type: String, default: ""},
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product'},

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'smartContracts' });

var currenciesModel = mongoose.model("smartContracts",schema);
module.exports = currenciesModel;
