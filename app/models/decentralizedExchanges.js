'use strict';

var mongoose = require('mongoose');

var DecentralizedExchangesModel = function () {
  var schema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    url: { type: String, default: "" },
    networks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'networks'}],
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'decentralizedExchanges' });

  return mongoose.model('decentralizedExchanges', schema);
};

module.exports = new DecentralizedExchangesModel();
