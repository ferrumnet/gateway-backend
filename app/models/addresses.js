'use strict';

var mongoose = require('mongoose');

var AddressesModel = function () {
  var schema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    network: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
    address: { type: String, default: "" },
    lastConnectedIpAddress: { type: String, default: ""},
    nonce: { type: String, default: ""},
    status: {
      isAddressAuthenticated: { type: Boolean, default: false },
      ipAddress: { type: String, default: ""},
      updatedAt: { type: Date, default: new Date() }
     },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'addresses' });

  return mongoose.model('addresses', schema);
};

module.exports = new AddressesModel();
