"use strict";

var mongoose = require("mongoose");

var productSchema = mongoose.Schema(
  {
    name: { type: String, default: "", required: true },
    nameInLower: { type: String, lowercase: true },
    icon: { type: String, default: ""},
    tags: { type: String, default: ""},
    metaData: [{ key: {type: String, default: "" }, value: {type: String, default: "" } }],
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

productSchema.pre("save", async function (next: any) {
  productSchema.nameInLower = productSchema.name;
  next();
});

productSchema.pre("findOneAndUpdate", async function (next: any) {
  if(productSchema._update.name)
  productSchema._update.nameInLower = productSchema._update.name;
  next();
});

var Product = mongoose.model("Product", productSchema);
module.exports = Product;
