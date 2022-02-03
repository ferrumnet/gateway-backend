'use strict';

var mongoose = require('mongoose');

var PresalesPledgedAddressesModel = function () {
  var schema = mongoose.Schema({
    presale: { type: mongoose.Schema.Types.ObjectId, ref: 'presales' },
    address: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'presalesPledgedAddresses' });

  return mongoose.model('presalesPledgedAddresses', schema);
};

module.exports = new PresalesPledgedAddressesModel();
