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
    logo: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    links: {
      websiteUrl: [],
      whitepaper: { type: String, default: "" },
      pitchDeck: { type: String, default: "" },
      social: {
        twitterUrl: { type: String, default: "" },
        telegramUrl: { type: String, default: "" },
        mediumUrl: { type: String, default: "" },
        discordUrl: { type: String, default: "" },
        instagramUrl: { type: String, default: "" },
        linkedInUrl: { type: String, default: "" }
       }
    },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'organizations' });

  return mongoose.model('organizations', leaderboardsSchema);
};

module.exports = new OrganizationsModel();
