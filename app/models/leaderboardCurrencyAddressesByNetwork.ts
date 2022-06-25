'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  currencyAddressesByNetwork: { type: mongoose.Schema.Types.ObjectId, ref: 'currencyAddressesByNetwork' },
  leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards' },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'leaderboardCurrencyAddressesByNetwork' });

var leaderboardCurrencyAddressesByNetworkModel = mongoose.model("leaderboardCurrencyAddressesByNetwork",schema);
module.exports = leaderboardCurrencyAddressesByNetworkModel;
