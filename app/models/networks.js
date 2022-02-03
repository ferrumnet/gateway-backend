'use strict';

var mongoose = require('mongoose');

var NetworksModel = function () {
  var leaderboardsSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    networkShortName: { type: String, default: "" },
    ferrumNetworkIdentifier: { type: String, default: "" },
    chainId: { type: String, default: "" },
    networkId: { type: String, default: "" },
    rpcUrl: { type: String, default: "" },
    blockExplorerUrl: { type: String, default: "" },
    mainnetCurrencySymbol: { type: String, default: "" },
    dexInputCurrencySymbolList: [],
    isTestnet: { type: Boolean, default: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'networks' });

  return mongoose.model('networks', leaderboardsSchema);
};

module.exports = new NetworksModel();
