"use strict";
var mongoose = require("mongoose");

var schema = mongoose.Schema(
  {
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    isActive: { type: Boolean, default: false },
    destinationNetwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "networks",
    },
    sourceNetwork: { type: mongoose.Schema.Types.ObjectId, ref: "networks" },
    destinationCabn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "currencyAddressesByNetwork",
    },
    sourceCabn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "currencyAddressesByNetwork",
    },
    destinationCurrency: { type: String, default: "" },
    receiveTransactionId: { type: String, default: "" },
    v: { type: Number, default: null },
    timestamp: { type: Number, default: null },
    destinationTransactionTimestamp: { type: Number, default: null },
    destinationWalletAddress: { type: String, default: "" },
    destinationAmount: { type: String, default: "" },
    sourceWalletAddress: { type: String, default: "" },
    sourceTimestamp: { type: Number, default: null },
    sourceCurrency: { type: String, default: "" },
    sourceAmount: { type: String, default: "" },
    generatorSig: {
      signatures: [
        {
          hash: { type: String, default: "" },
          signature: { type: String, default: "" },
        },
      ],
      salt: { type: String, default: "" },
    },
    validatorSig: [
      {
        signatures: [
          {
            hash: { type: String, default: "" },
            signature: { type: String, default: "" },
          },
        ],
        salt: { type: String, default: "" },
        address: { type: String, default: "" },
      },
    ],
    payBySig: {
      hash: { type: String, default: "" },
      signatures: [],
      salt: { type: String, default: "" },
    },
    originCurrency: { type: String, default: "" },
    sendToCurrency: { type: String, default: "" },
    used: { type: String, default: "" }, //can be '', 'pending', 'failed', 'completed'
    status: { type: String, default: "swapPending" },
    useTransactions: [
      {
        transactionId: { type: String },
        status: { type: String },
        timestamp: { type: Number },
      },
    ],
    execution: {
      status: { type: String, default: "" }, // can be '', 'pending', 'failed', 'timedout', 'sucess'
      transactions: {
        network: { type: String, default: "" },
        transactionId: { type: String, default: "" },
        timestamp: { type: Number, default: null },
        status: { type: String, default: "" }, //can be 'pending', 'failed', 'timedout', 'sucess'
        message: { type: String, default: "" },
      },
    },
    signature: { type: Number, default: null },
    blocked: { type: Boolean, default: false },
    creator: { type: String, default: "" },
    sourceSmartContractAddress: { type: String, default: "" },
    destinationSmartContractAddress: { type: String, default: "" },
    nodeJob: {
      id: { type: String, default: "" },
      status: { type: String, default: "pending" }, //can be '', 'pending', 'created', 'failed', 'completed'
      createdAt: { type: Date, default: new Date() },
      updatedAt: { type: Date, default: new Date() },
    },
    sourceAssetType: { type: String, default: "" },
    destinationAssetType: { type: String, default: "" },
    bridgeAmount: { type: String, default: "" },
    version: { type: String, default: "" },
  },
  { collection: "swapAndWithdrawTransactions" }
);

var currenciesModel = mongoose.model("swapAndWithdrawTransactions", schema);
module.exports = currenciesModel;
