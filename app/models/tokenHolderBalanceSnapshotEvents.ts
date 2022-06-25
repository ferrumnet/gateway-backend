"use strict";

var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    type: { type: String, enum : {values: ['manual','schedule'], message: 'Invalid type'}, default: 'manual'},
    triggeredSnapshotDateTime: { type: Date, required: true, default: new Date() },
    actualSnapshotDateTime: { type: Date, default: new Date()},
    blockNumbers: { type: Array, default: [] },
    leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'leaderboards' },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations', required: true  },
    isActive: { type: Boolean, default: true  },
    status: { type: String, enum : ['pending','completed','failed'], default: 'pending'},
    errorMessage: { type: String, default: "" },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  {
    timestamps: true,
    collection: 'tokenHolderBalanceSnapshotEvents'
  },

);

var TokenHolderBalanceSnapshotEvents = mongoose.model("TokenHolderBalanceSnapshotEvents", schema);
module.exports = TokenHolderBalanceSnapshotEvents;
