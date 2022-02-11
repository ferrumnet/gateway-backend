'use strict';

var mongoose = require('mongoose');

var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var _ = require('lodash');

function emailValidate(input) {
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(input);
}


var UsersModel = function () {
  var usersSchema = mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'addresses'}],
    name: { type: String, default: ""},
    nameInLower: { type: String, default: ""},
    firstName: { type: String, default: "" },
    firstNameInLower: { type: String, default: "" },
    lastName: { type: String, default: "" },
    lastNameInLower: { type: String, default: "" },
    userName: { type: String, default: "" },
    email: { type: String, default: ""},
    password: { type: String, default: "" },
    telegramHandle: { type: String, default: "" },
    symbol: { type: String, default: "" },
    leaderBoardRoute: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
    role: { type: String, default: "organizationAdmin" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
    isGCAccess: { type: Boolean, default: false },
    emailVerificationCode: { type: String, default: "" },
    emailVerificationCodeGenratedAt: { type: Date, default: new Date() },
    isEmailAuthenticated: { type: Boolean, default: false },
    forgotPasswordAuthenticationToken: { type: String, default: "" },
    apiKey: { type: String, default: "" },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    timeZone: { type: String, default: "" }
  },{ collection: 'users' });

  usersSchema.statics.getHashedPassword = function (password) {

    return crypto.createHash('sha256').update(password).digest('base64');
  };

  usersSchema.methods.createAPIToken = function () {
    var payload = this.toClientObject();
    return jwt.sign({_id:payload._id, email: payload.email}, global.kraken.get('app:jwtSecret'));
  };
  usersSchema.methods.toClientObject = function () {
    var rawObject = this.toObject();
    delete rawObject.password;
    delete rawObject.__v;
    return rawObject;
  };

  return mongoose.model('users', usersSchema);
};

module.exports = new UsersModel();
