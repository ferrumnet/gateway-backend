"use strict";

var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizations', required: true  },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true  },
    actualLimit: { type: Number, default: null },
    usedLimit: { type: Number, default: null },
    isActive: { type: Boolean, default: false },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },    
  },
  { timestamps: true },
);

var Subscription = mongoose.model("Subscription", schema);
module.exports = Subscription;
