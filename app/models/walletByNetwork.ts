'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'wallets' },
  network: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
  positionForWallet: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
},{ collection: 'walletByNetwork' });

var crucibleMintCapsModel = mongoose.model("walletByNetwork",schema);
module.exports = crucibleMintCapsModel;
