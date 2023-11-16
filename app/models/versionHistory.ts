"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    walletsVersion: Number,
    networksVersion: Number,
    cabnsVersion: Number,
  },
  { collection: "versionHistory" }
);

var versionHistoryModel = mongoose.model("versionHistory", schema);
module.exports = versionHistoryModel;
