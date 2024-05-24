"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    key: { type: String, default: "" },
    address: { type: String, default: "" },
    tag: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isNonEVM: { type: Boolean, default: false },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: "randomOrdinalsPassportKeys" }
);

var randomOrdinalsPassportKeys = mongoose.model(
  "randomOrdinalsPassportKeys",
  schema
);
module.exports = randomOrdinalsPassportKeys;
