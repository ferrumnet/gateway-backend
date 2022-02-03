'use strict';

var mongoose = require('mongoose');

var OrganizationsModel = function () {
  var leaderboardsSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    websiteUrl: { type: String, default: "" },
    siteName: { type: String, default: "" },
    status: { type: String, default: "pending" },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'organizations' });

  return mongoose.model('organizations', leaderboardsSchema);
};

module.exports = new OrganizationsModel();
