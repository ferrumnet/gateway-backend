"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
       cronName:{ type: String, required:true, unique: true },
       isActive:{type:Boolean, default: true},
       paused:{type:Boolean, default: false},
       pauseReason:{type:String, required:false},
    }, {
       collection: 'temporaryPauseCrons',
       Timestamps: true
  }
);

var TemporaryPauseCrons = mongoose.model("TemporaryPauseCrons", schema);
module.exports = TemporaryPauseCrons;
