'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  name: { type: String, default: "" },
  nameInLower: { type: String, default: ""},
  logo: { type: String, default: "" },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
},{ collection: 'wallets' });

var crucibleMintCapsModel = mongoose.model("wallets",schema);
module.exports = crucibleMintCapsModel;
