'use strict';

var mongoose = require('mongoose');

var PreSalesModel = function () {
  var schema = mongoose.Schema({
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    logo: { type: String, default: "" },
    description: { type: String, default: ""},
    attachment: {
      name: { type: String, default: ""},
      url: { type: String, default: ""},
    },
    poolInformation: {
      accessType: { type: String, default: ""},
      tokenDistribution: { type: String, default: ""},
      tokenPrice: { type: String, default: ""},
      TGEMarketCap: { type: String, default: ""},
      fullyMarketCap: { type: String, default: ""},
    },
    tokenInformation: {
      symbols: { type: String, default: ""},
      totalSupply: { type: String, default: ""}
    },
    pledgedAddressesCount: { type: Number, default: 0 },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date, default: new Date() },

    status: { type: String, default: "pending" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'presales' });

  return mongoose.model('presales', schema);
};

module.exports = new PreSalesModel();
