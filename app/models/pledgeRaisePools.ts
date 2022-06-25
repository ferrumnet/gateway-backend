'use strict';

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  raisePoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'raisePools' },
  pledgedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  address: { type: String, default: "" },
  ip: { type: String, default: ""},
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updateByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'pledgeRaisePools' });

var pledgeRaisePoolsModel = mongoose.model("pledgeRaisePools",schema);
module.exports = pledgeRaisePoolsModel;
