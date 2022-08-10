'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdByOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
  headerHtml: { type: String, default: "" },
  footerHtml: { type: String, default: ""},
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
},{ collection: 'organizationWhiteLables' });

var currenciesModel = mongoose.model("organizationWhiteLables",schema);
module.exports = currenciesModel;
