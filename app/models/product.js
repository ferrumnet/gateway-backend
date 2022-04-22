"use strict";

var mongoose = require("mongoose");

var productSchema = mongoose.Schema(
  {
    name: { type: String, default: "", required: true },
    nameInLower: { type: String, lowercase: true },
    icon: { type: String, default: ""},
    tags: { type: String, default: ""},
    metadata: [{ key: {type: String, default: "" }, value: {type: String, default: "" } }],
    menuItems: [],
    menuPosition: {
      organizationAdminPosition: { type: Number, default: null},
      communityMemberPosition: { type: Number, default: null},
    },

    isActive: { type: Boolean, default: false },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
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
