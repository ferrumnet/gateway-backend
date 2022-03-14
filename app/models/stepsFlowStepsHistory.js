'use strict';

var mongoose = require('mongoose');

var StepFlowStepsHistoryModel = function () {
  var StepFlowStepsHistorySchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    stepFlow:  { type: mongoose.Schema.Types.ObjectId, ref: 'stepsFlow' },
    status: { type: String, enum : ['started','pending','completed'], default: "pending"},
    sequence: {type: Number },
    isActive: { type: Boolean, default: true },
    step: { type: mongoose.Schema.Types.ObjectId, ref: 'steps' },

    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'stepFlowStepsHistory' });

  return mongoose.model('stepFlowStepsHistory', StepFlowStepsHistorySchema);
};

module.exports = new StepFlowStepsHistoryModel();
