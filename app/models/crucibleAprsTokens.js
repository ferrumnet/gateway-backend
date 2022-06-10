'use strict';

var mongoose = require('mongoose');

var CrucibleAprsTokensModel = function () {
  var crucibleAprsSchema = mongoose.Schema({
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    tokens: [{
      tokenContract: { type: String, default: "" },
      tokenSymbol: { type: String, default: "" }
    }],
    skakingContract: { type: String, default: "" },
    apeRouter: { type: String, default: "" },
    taxDistributor: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
  },{ collection: 'crucibleAprsTokens' });

  return mongoose.model('crucibleAprsTokens', crucibleAprsSchema);
};

module.exports = new CrucibleAprsTokensModel();
