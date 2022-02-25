"use strict";

var mongoose = require("mongoose");

const packageSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    nameInLower: { type: String, lowercase: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true  },
    limitation: { type: Number, default: false },
    isFree: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    price: {  
      type: Number,
      get: v => (v/100).toFixed(2),
      set: v => v*100
  },
  },
  {
    toJSON: { getters: true }
  },
  { timestamps: true },
);

packageSchema.pre("save", async function (next) {
  this.nameInLower = this.name;
  next();
});

packageSchema.pre("findOneAndUpdate", async function (next) {
  this._update.nameInLower = this._update.name;
  next();
});

const Package = mongoose.model("Package", packageSchema);
module.exports = Package;
