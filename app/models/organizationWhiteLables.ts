"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    createdByOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
    },
    type: { type: String, default: "" },
    colors: {
      primary: { type: String, default: "" },
      primaryLight: { type: String, default: "" },
      secondary: { type: String, default: "" },
      red: { type: String, default: "" },
      green: { type: String, default: "" },
      neutral01: { type: String, default: "" },
      neutral02: { type: String, default: "" },
      neutral03: { type: String, default: "" },
      neutral04: { type: String, default: "" },
      neutral05: { type: String, default: "" },
    },
    appBackgroundColor: { type: String, default: "" },
    menuBackgroundColor: { type: String, default: "" },
    logo: { type: String, default: "" },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: "organizationWhiteLables" }
);

var organizationWhiteLablesModel = mongoose.model(
  "organizationWhiteLables",
  schema
);
module.exports = organizationWhiteLablesModel;
