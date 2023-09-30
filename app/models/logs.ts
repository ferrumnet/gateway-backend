'use strict';

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  browser: { type: String, default: "" },
  userDevice: { type: String, default: ""},
  ipAddress: { type: String, default: ""},
  type: { type: String, default: "" },
  metadata: [{ key: {type: String, default: "" }, value: {type: String, default: "" } }],
  connectedWalletInformation: {
    address: { type: String, default: "" },
    balances: [{
      currencyName: { type: String, default: "" },
      currencySymbol: { type: String, default: "" },
      currencyBalance: { type: String, default: "" },
      currencyDecimals: { type: String, default: "" }
    }]
  },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'logs' });

var logsModel = mongoose.model("logs",schema);
module.exports = logsModel;
