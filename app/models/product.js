"use strict";

var mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    nameInLower: { type: String, lowercase: true },
    isActive: { type: Boolean, default: false },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  this.nameInLower = this.name;
  next();
});

productSchema.pre("findOneAndUpdate", async function (next) {
  if(this._update.name)
  this._update.nameInLower = this._update.name;
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
