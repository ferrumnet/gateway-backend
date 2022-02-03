'use strict';

var mongoose = require('mongoose');

var JobsModel = function () {
  var schema = mongoose.Schema({
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'competitions' },
    type: { type: String, default: "" },
    status: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
  },{ collection: 'jobs' });

  return mongoose.model('jobs', schema);
};

module.exports = new JobsModel();
