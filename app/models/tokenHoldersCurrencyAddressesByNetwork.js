'use strict';

var mongoose = require('mongoose');

var TokenHoldersCurrencyAddressesByNetworkNetworkModel = function () {
  var schema = mongoose.Schema({
    currencyAddressesByNetwork: { type: mongoose.Schema.Types.ObjectId, ref: 'currencyAddressesByNetwork' },
    tokenContractAddress: { type: String, default: "" },
    tokenHolderAddress: { type: String, default: "" },
    tokenHolderQuantity: { type: String, default: "" },
    currentBlock: { type: String, default: "" },

    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'tokenHoldersCurrencyAddressesByNetwork' });

  return mongoose.model('tokenHoldersCurrencyAddressesByNetwork', schema);
};

module.exports = new TokenHoldersCurrencyAddressesByNetworkNetworkModel();
