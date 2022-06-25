'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  name: { type: String, default: "" },
  nameInLower: { type: String, default: ""},
  isActive: { type: Boolean, default: true },

  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'steps' });

var stepModel = mongoose.model("steps",schema);
module.exports = stepModel;
