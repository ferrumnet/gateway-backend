"use strict";

var mongoose = require("mongoose");
var collectionName = "referrals";

var schema = mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: collectionName }
);

var referralsModel = mongoose.model(collectionName, schema);
module.exports = referralsModel;
