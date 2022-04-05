'use strict';

var mongoose = require('mongoose');

var StepsFlowModel = function () {
  var StepsFlowSchema = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    isActive: { type: Boolean, default: true },
    stepFlowSteps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'stepFlowSteps' }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' },

    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'stepsFlow' });

  return mongoose.model('stepsFlow', StepsFlowSchema);
};

module.exports = new StepsFlowModel();
