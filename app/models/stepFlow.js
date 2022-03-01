'use strict';

var mongoose = require('mongoose');

var StepFlowsModel = function () {
  var PreSalesStepFlowsSchema = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    status: { type: String, default: "pending" },
    isActive: { type: Boolean, default: true },
    orderIndex: { type: Array, default: []},
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' },

    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updatedByUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'stepFlows' });

  return mongoose.model('stepFlows', PreSalesStepFlowsSchema);
};

module.exports = new StepFlowsModel();
