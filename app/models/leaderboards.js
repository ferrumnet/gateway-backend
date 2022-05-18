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
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" , required: true },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }, // this key needs be replaced on all over the app. Right now key user is used on every where. So once this will replaced we will remove user from the model
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations', required: true  },
    isVisibleForPublicMenuItem: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'leaderboards' });

  return mongoose.model('leaderboards', leaderboardsSchema);
};

module.exports = new LeaderboardsModel();
