"use strict";

var mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    type: { type: String, enum : ['manual','schedule'], default: 'schedule'},
    triggeredSnapshotDateTime: { type: Date, required: true },
    actualSnapshotDateTime: { type: Date, required: true },
    blockNumbers: { type: Array },
    leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards' },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizations', required: true  },
    isActive: { type: Boolean, required: true },
    status: { type: String, enum : ['pending','complete','failed'], default: 'pending'},
    errorMessage: { type: String },
  },
  {
    timestamps: true
  },

);

const TokenHolderBalanceSnapshotEvent = mongoose.model("TokenHolderBalanceSnapshotEvent", schema);
module.exports = TokenHolderBalanceSnapshotEvent;

