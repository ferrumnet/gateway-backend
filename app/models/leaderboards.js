'use strict';

var mongoose = require('mongoose');

var LeaderboardsModel = function () {
  var leaderboardsSchema = mongoose.Schema({
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    exclusionWalletAddressList: [],
    leaderboardCurrencyAddressesByNetwork: [{ type: mongoose.Schema.Types.ObjectId, ref: 'leaderboardCurrencyAddressesByNetwork'}],
    status: { type: String, default: "pending" },
    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizations', required: true  },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'leaderboards' });

  return mongoose.model('leaderboards', leaderboardsSchema);
};

module.exports = new LeaderboardsModel();
