'use strict';

var mongoose = require('mongoose');

var StepFlowStepsModel = function () {
  var StepFlowStepsSchema = mongoose.Schema({
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    isActive: { type: Boolean, default: true },

    stepId: { type: mongoose.Schema.Types.ObjectId, ref: 'step' },
    stepsFlowId: { type: mongoose.Schema.Types.ObjectId, ref: 'stepFlow' },

    stepsRenderingJson: { type: mongoose.Schema.Types.ObjectId },
    orderIndex: { type: mongoose.Schema.Types.Number },

    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'steps' });

  return mongoose.model('steps', StepFlowStepsSchema);
};

module.exports = new StepFlowStepsModel();

stepId (reference)

stepsRenderingJson

orderIndex

stepsFlowId (reference)