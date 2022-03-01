'use strict';

var mongoose = require('mongoose');

var StepModel = function () {
  var PreSalesStepSchema = mongoose.Schema({
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    isActive: { type: Boolean, default: true },
    stepJson: { type: Object,  default: {}},

    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'steps' });

  return mongoose.model('steps', PreSalesStepSchema);
};

module.exports = new StepModel();
