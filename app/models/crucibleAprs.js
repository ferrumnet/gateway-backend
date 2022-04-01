'use strict';

var mongoose = require('mongoose');

var CrucibleAprsModel = function () {
  var crucibleAprsSchema = mongoose.Schema({
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    cfrm: { type: String, default: "" },
    cfrmLp: { type: String, default: "" },
    cfrmX: { type: String, default: "" },
    cfrmXLp: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
  },{ collection: 'crucibleAprs' });

  return mongoose.model('crucibleAprs', crucibleAprsSchema);
};

module.exports = new CrucibleAprsModel();
