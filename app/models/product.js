"use strict";

var mongoose = require("mongoose");
var paginate = require("./plugins/paginate");

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    nameInLower: { type: String, lowercase: true },
    isActive: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  this.nameInLower = this.name;
  next();
});

productSchema.pre("findOneAndUpdate", async function (next) {
  this._update.nameInLower = this._update.name;
  next();
});

productSchema.plugin(paginate);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
