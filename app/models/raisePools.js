'use strict';

var mongoose = require('mongoose');

var RaisePoolsModel = function () {
  var schema = mongoose.Schema({
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations'},
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    imageUrl: { type: String, default: "" },
    description: { type: String, default: ""},
    poolShortDescription: { type: String, default: ""},
    pitchDeckUrl: { type: String, default: ""},
    tokenMetricsUrl: { type: String, default: ""},
    vestingSchedule: { type: String, default: ""},
    pledgeCount: { type: Number, default: 0 },
    startDateTime: { type: Date, default: new Date() },
    endDateTime: { type: Date, default: new Date() },
    status: { type: String, default: "upcoming" },

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'raisePools' });

  return mongoose.model('raisePools', schema);
};

module.exports = new RaisePoolsModel();
