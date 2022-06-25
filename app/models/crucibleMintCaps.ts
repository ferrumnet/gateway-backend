'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  cFRMMaxCap: { type: String, default: "" },
  cFRMxMaxCap: { type: String, default: "" },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
},{ collection: 'crucibleMintCaps' });

var crucibleMintCapsModel = mongoose.model("crucibleMintCaps",schema);
module.exports = crucibleMintCapsModel;
