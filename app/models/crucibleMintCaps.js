'use strict';

var mongoose = require('mongoose');

var CrucibleMintCapsModel = function () {
  var crucibleMintCapsSchema = mongoose.Schema({
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    cFRMMaxCap: { type: String, default: "" },
    cFRMxMaxCap: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
  },{ collection: 'crucibleMintCaps' });

  return mongoose.model('crucibleMintCaps', crucibleMintCapsSchema);
};

module.exports = new CrucibleMintCapsModel();
