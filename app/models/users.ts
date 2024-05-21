"use strict";

var mongoose = require("mongoose");
import crypto from "crypto";
var jwt = require("jsonwebtoken");
var _ = require("lodash");

function emailValidate(input: any) {
  var regex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(input);
}

var schema = mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "addresses" }],
    name: { type: String, default: "" },
    nameInLower: { type: String, default: "" },
    firstName: { type: String, default: "" },
    firstNameInLower: { type: String, default: "" },
    lastName: { type: String, default: "" },
    lastNameInLower: { type: String, default: "" },
    userName: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    telegramHandle: { type: String, default: "" },
    symbol: { type: String, default: "" },
    leaderBoardRoute: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
    role: { type: String, default: "organizationAdmin" },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
    },
    isGCAccess: { type: Boolean, default: false },
    emailVerificationCode: { type: String, default: "" },
    emailVerificationCodeGenratedAt: { type: Date, default: new Date() },
    isEmailAuthenticated: { type: Boolean, default: false },
    emailToVerify: {
      type: String,
      lowercase: true,
      unique: true,
      validate: [emailValidate, "Email is not valid"],
    },
    forgotPasswordAuthenticationToken: { type: String, default: "" },
    apiKey: { type: String, default: "" },
    parentOrganizationAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    approvalStatusAsOrganizationAdminBySuperAdmin: {
      type: String,
      enum: {
        values: ["approved", "declined", "pending", ""],
        message: "Invalid approval status",
      },
      default: "pending",
    },
    referral: { type: mongoose.Schema.Types.ObjectId, ref: "referrals" },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    timeZone: { type: String, default: "" },
  },
  { collection: "users" }
);

schema.statics.getHashedPassword = function (password: any) {
  return crypto.createHash("sha256").update(password).digest("base64");
};

schema.methods.createAPIToken = function () {
  var payload = this.toClientObject();
  let planObject = { _id: payload._id, email: payload.email };
  return (global as any).commonFunctions.createToken(
    planObject,
    utils.globalTokenExpiryTime
  );
};
schema.methods.createProfileUpdateToken = function (
  token: any,
  signature: any
) {
  return jwt.sign({ token, signature }, (global as any).environment.jwtSecret);
};
schema.methods.toClientObject = function () {
  var rawObject = this.toObject();
  delete rawObject.password;
  delete rawObject.emailVerificationCode;
  delete rawObject.forgotPasswordAuthenticationToken;
  delete rawObject.emailVerificationCodeGenratedAt;

  delete rawObject.__v;
  return rawObject;
};

var usersModel = mongoose.model("users", schema);
module.exports = usersModel;
