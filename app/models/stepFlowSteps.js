'use strict';

var mongoose = require('mongoose');

var StepFlowStepsModel = function () {
  var StepFlowStepsSchema = mongoose.Schema({
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    isActive: { type: Boolean, default: true },

    step: { type: mongoose.Schema.Types.ObjectId, ref: 'steps' },
    stepsFlow: { type: mongoose.Schema.Types.ObjectId, ref: 'stepFlow' },

    stepsRenderingJson: { type: mongoose.Schema.Types.Mixed },
    orderIndex: { type: mongoose.Schema.Types.Number },
    
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' },

    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'stepFlowSteps' });

  return mongoose.model('stepFlowSteps', StepFlowStepsSchema);
};

module.exports = new StepFlowStepsModel();
