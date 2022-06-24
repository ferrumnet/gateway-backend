"use strict";
var mongoose = require("mongoose");

var packageSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    nameInLower: { type: String, lowercase: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true  },
    limitation: { type: Number, default: false },
    isFree: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    price: {  
      type: Number,
      get: (v: any) => (v/100).toFixed(2),
      set: (v: any) => v*100
  },
  },
  {
    toJSON: { getters: true },
    timestamps: true
  },

);

packageSchema.pre("save", async function (next: any) {
  packageSchema.nameInLower = packageSchema.name;
  next();
});

packageSchema.pre("findOneAndUpdate", async function (next: any) {
  if(packageSchema._update.name)
  packageSchema._update.nameInLower = packageSchema._update.name;
  next();
});

var Package = mongoose.model("Package", packageSchema);
module.exports = Package;
