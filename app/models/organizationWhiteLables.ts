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
    backgroundImage: { type: String, default: "" },
    tittle: { type: String, default: "" },
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
