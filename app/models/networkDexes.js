'use strict';

var mongoose = require('mongoose');

var NetworkDexesModel = function () {
  var schema = mongoose.Schema({
    network: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
    dex: { type: mongoose.Schema.Types.ObjectId, ref: 'decentralizedExchanges' },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'networkDexes' });

  return mongoose.model('networkDexes', schema);
};

module.exports = new NetworkDexesModel();
