'use strict';

var mongoose = require('mongoose');

var CrucibleAprsModel = function () {
  var crucibleAprsSchema = mongoose.Schema({
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    tokenSymbol: { type: String, default: "" },
    timeReference: { type: String, default: "" },
    totalStake: { type: String, default: "" },
    price: { type: String, default: "" },
    APR: { type: Number, default: null },
    volumeOfRewardsDistributedInThePast24Hours: { type: Number, default: null },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
  },{ collection: 'crucibleAprs' });

  return mongoose.model('crucibleAprs', crucibleAprsSchema);
};

module.exports = new CrucibleAprsModel();
