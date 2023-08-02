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
    appBackgroundColor: { type: String, default: "" },
    menuBackgroundColor: { type: String, default: "" },
    logo: { type: String, default: "" },
    colors: {
      primary: { type: String, default: "" },
      primaryLight: { type: String, default: "" },
      secondary: { type: String, default: "" },
      red: { type: String, default: "" },
      green: { type: String, default: "" },
      backgroundDark: { type: String, default: "" },
      background: { type: String, default: "" },
      neutral: { type: String, default: "" },
      neutralLight: { type: String, default: "" },
      backgroundLight: { type: String, default: "" },
    },
    cards: {
      crucibleLandingMiniCard: { type: String, default: "" },
      crucibleIntroductionCard: { type: String, default: "" },
      crucibleDashboardCard: { type: String, default: "" },
      crucibleTokenCard: { type: String, default: "" },
      crucibleMyBalanceCard: { type: String, default: "" },
      crucibleSuccessStepOneCard: { type: String, default: "" },
      crucibleSuccessStepTwoCard: { type: String, default: "" },
      crucibleCongratsCard: { type: String, default: "" },
      crucibleCongratsInfoCard: { type: String, default: "" },
    },
    dialogs: {
      crucibleModalTransactionConfirmation: { type: String, default: "" },
      crucibleModalApproved: { type: String, default: "" },
      crucibleModalTransactionProcessed: { type: String, default: "" },
      crucibleModalConnectWallet: { type: String, default: "" },
      crucibleModalAccount: { type: String, default: "" },
    },
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
