const {
  waitForConfirmation,
  default: algosdk,
  ALGORAND_MIN_TX_FEE,
} = require("algosdk");
const fs = require("fs");
const { spawn } = require("child_process");
const { Promise, reject } = require("bluebird");
const { resolve } = require("path");
const { db } = global;
const axios = require("axios").default;
require("dotenv").config();
// const PythonShell = require("python-shell").PythonShell;

const algodToken =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const algodServer = "http://3.145.206.208";
const algodPort = 4001;
const creatorMnemonic =
  "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";

async function deployContract(
  tokenAddress,
  stakingCapital,
  stakingStarts,
  stakingEnds,
  withdrawStarts,
  withdrawEnds,
  stakingId,
  storageAppId
) {
  // ADMIN
  // creatorMnemonic =
  //   "wheel liar breeze fame pelican glove stool apology truth reduce salon junior orchard sign march unfair grid steak ecology satoshi honey horror drama ability patch";
  // creatorMnemonic =
  //   "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
  let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  let sender = creatorAccount.addr;

  // Setup AlgodClient Connection
  // const algodToken =
  //   "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  // const algodServer = "http://3.145.206.208";
  // const algodPort = 4001;
  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  // get node suggested parameters (sp)
  let suggestedParams = await algodClient.getTransactionParams().do();
  // comment out the next two lines to use suggested fee
  // suggestedParams.fee = 5000;
  // params.flatFee = true;

  // let token_address = 66863719;
  let token_address = Number(tokenAddress);
  // let reward_address = 66863719;
  let reward_address = Number(tokenAddress);

  // let staking_total = 500;
  let staking_total = Number(stakingCapital);
  let total_supply = 1000000;
  // let stakingStarts = "2022-03-15 17:32:00.000";
  // let stakingEnds = "2022-03-15 17:35:00.000";
  // let withdrawStarts = "2022-03-15 17:36:00.000";
  // let withdrawEnds = "2022-03-15 17:40:00.000";
  // python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(79584368).to_bytes(8, 'big'))))"

  // \YTFCPZQS5RTECX72SXKHTD2NLRSCVNNOUDHJF3TJIRBU4WQ2QNJSRW6CB4
  console.log(stakingStarts);
  console.log(stakingEnds);
  console.log(withdrawStarts);
  console.log(withdrawEnds);
  let staking_starts = Math.floor(
    new Date(
      moment.utc(stakingStarts).format("YYYY-MM-DD HH:mm:ss Z")
    ).getTime() / 1000
  );
  let staking_ends = Math.floor(
    new Date(
      moment.utc(stakingEnds).format("YYYY-MM-DD HH:mm:ss Z")
    ).getTime() / 1000
  );
  let withdraw_starts = Math.floor(
    new Date(
      moment.utc(withdrawStarts).format("YYYY-MM-DD HH:mm:ss Z")
    ).getTime() / 1000
  );
  let withdraw_ends = Math.floor(
    new Date(
      moment.utc(withdrawEnds).format("YYYY-MM-DD HH:mm:ss Z")
    ).getTime() / 1000
  );

  let appArgs = [];

  appArgs.push(algosdk.encodeUint64(token_address));
  appArgs.push(algosdk.encodeUint64(reward_address));
  appArgs.push(algosdk.encodeUint64(staking_starts));
  appArgs.push(algosdk.encodeUint64(staking_ends));
  appArgs.push(algosdk.encodeUint64(withdraw_starts));
  appArgs.push(algosdk.encodeUint64(withdraw_ends));
  appArgs.push(algosdk.encodeUint64(staking_total));
  appArgs.push(algosdk.encodeUint64(total_supply));
  accounts = [];
  foreignApps = [];
  foreignAssets = [];
  foreignAssets.push(token_address);
  foreignAssets.push(reward_address);

  // declare application state storage (immutable)
  localInts = 4;
  localBytes = 4;
  globalInts = 20;
  globalBytes = 5;

  // Get ByteCode of Approval Program
  let approvalProgram = await readApprovalTeal(false);
  // console.log("Approval Program ByteCode: ",approvalProgram);

  // Get ByteCode of ClearState Program
  let clearProgram = await readClearTeal();
  // console.log("Clear Program ByteCode: ",clearProgram);

  // declare onComplete as NoOp to execute the SmartContract
  onComplete = algosdk.OnApplicationComplete.NoOpOC;

  // create unsigned transaction
  let txn = algosdk.makeApplicationCreateTxn(
    sender,
    suggestedParams,
    onComplete,
    approvalProgram,
    clearProgram,
    localInts,
    localBytes,
    globalInts,
    globalBytes,
    appArgs,
    accounts,
    foreignApps,
    foreignAssets
  );

  // console.log(txn);

  // to fetch the txn ID
  let txId = txn.txID().toString();
  console.log(txId);

  // Sign Transaction
  let signedTxn = txn.signTxn(creatorAccount.sk);
  console.log("Signed Transaction with txID: ", signedTxn);

  // submit the transaction
  let response = await algodClient.sendRawTransaction(signedTxn).do();
  console.log(response);

  // wait for confirmation
  let timeout = 7;
  let check = await waitForConfirmation(algodClient, txId, timeout);
  console.log(check);
  // display results
  let txResponse = await algodClient.pendingTransactionInformation(txId).do();

  let appId = txResponse["application-index"];

  console.log("Deployed a smartContract on Algorand: ", appId);
  // const encodedAddress = algosdk.encodeAddress("appID" + appId);

  // console.log("Deployed a smartContract on Algorand: ", appId, encodedAddress);

  const encodedAddress = await axios.get(
    `http://127.0.0.1:5000/algorand/${appId}`
  );
  return { appId, encodedAddress: encodedAddress.data.contractAddress };
}
async function readApprovalTeal(isStorageApp) {
  var approvalProgramSource;
  var content;
  if (!isStorageApp) {
    approvalProgramSource = fs.readFileSync(
      "./app/lib/middlewares/helpers/stakingHelpers/staking.teal",
      "utf8"
    );
  } else {
    approvalProgramSource = fs.readFileSync(
      "./app/lib/middlewares/helpers/stakingHelpers/prog.teal",
      "utf8"
    );
  }
  content = await getCompiledResult(approvalProgramSource);
  return content;
}

async function readClearTeal() {
  clearProgramSource = `#pragma version 4
    int 1
    `;
  var content = await getCompiledResult(clearProgramSource);
  return content;
}

async function getCompiledResult(data) {
  let compiledSource = await compileTEAL(data);
  return compiledSource;
}

async function compileTEAL(content) {
  // Setup AlgodClient Connection
  // const algodToken =
  //   "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  // const algodServer = "http://3.145.206.208";
  // const algodPort = 4001;
  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  // Read Teal from Content
  let programSource = content;

  // compile program to binary
  let compiledSource = await compileProgram(algodClient, programSource);

  return compiledSource;
}
// to compile program source (TEAL) to Bytecode
async function compileProgram(algodClient, programSource) {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algodClient.compile(programBytes).do();
  let compileBytes = new Uint8Array(
    Buffer.from(compileResponse.result, "base64")
  );
  return compileBytes;
}
async function setup(tokenAddress, stakingCapital, appId) {
  // Setup AlgodClient Connection
  // const algodToken =
  //   "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  // const algodServer = "http://3.145.206.208";
  // const algodPort = 4001;
  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  // ADMIN
  // let creatorMnemonic =
  //   "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
  // let creatorMnemonic =
  //   "wheel liar breeze fame pelican glove stool apology truth reduce salon junior orchard sign march unfair grid steak ecology satoshi honey horror drama ability patch";
  let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  let sender = creatorAccount.addr;

  // get node suggested parameters (sp)
  let suggestedParams = await algodClient.getTransactionParams().do();
  suggestedParams.fee = 5000;
  let index = Number(appId);
  // let token_address = 66863719;
  let token_address = Number(tokenAddress);
  let reward_address = Number(tokenAddress);
  // let reward_address = Number(stakingCapital);
  account = [];
  foreignApp = [];
  foreignAssets = [];
  foreignAssets.push(token_address);
  foreignAssets.push(reward_address);

  let action = "setup";
  let appArgs = [];
  appArgs.push(new Uint8Array(Buffer.from(action)));

  // create unsigned transaction
  let txn = algosdk.makeApplicationNoOpTxn(
    sender,
    suggestedParams,
    index,
    appArgs,
    account,
    foreignApp,
    foreignAssets
  );

  // get tx ID
  let txId = txn.txID().toString();
  console.log("setup Tx ID: ", txId);

  // sign transaction
  let signedTxn = txn.signTxn(creatorAccount.sk);
  console.log("setup signed Txn: ", signedTxn);

  // submit the transaction
  let response = await algodClient.sendRawTransaction(signedTxn).do();
  console.log("Raw transaction submitted: ", response);

  // wait for the transaction confirmation
  let timeout = 4;
  await waitForConfirmation(algodClient, txId, timeout);

  // response display
  let txResponse = await algodClient.pendingTransactionInformation(txId).do();
  console.log("Setup Contract [App-ID]: ", txResponse["txn"]["txn"]["apid"]);
  return txResponse;
}
async function addReward(
  tokenAddress,
  encodedAddress,
  rewardAmount,
  withdrawableAmount,
  appId
) {
  console.log("---" + encodedAddress.replace(/\s/g, "") + "---");
  // Setup AlgodClient Connection

  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  //ADMIN

  // let creatorMnemonic =
  //   "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
  // let creatorMnemonic =
  //   "wheel liar breeze fame pelican glove stool apology truth reduce salon junior orchard sign march unfair grid steak ecology satoshi honey horror drama ability patch";
  let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  let sender = creatorAccount.addr;

  // Contract Address
  // let smartContract =
  //   "YTFCPZQS5RTECX72SXKHTD2NLRSCVNNOUDHJF3TJIRBU4WQ2QNJSRW6CB4";
  let smartContract = encodedAddress.replace(/\s/g, "");

  // get node suggested parameters (sp)
  let suggestedParams = await algodClient.getTransactionParams().do();
  suggestedParams.fee = ALGORAND_MIN_TX_FEE;
  let index = Number(appId);

  //python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(79584368).to_bytes(8, 'big'))))"
  // \YTFCPZQS5RTECX72SXKHTD2NLRSCVNNOUDHJF3TJIRBU4WQ2QNJSRW6CB4
  // Arguments to be passed in App Call
  let reward_address = Number(tokenAddress);
  // let reward_address = 66863719;
  // let reward_address = 77861997;
  account = [];
  foreignApp = [];
  foreignAssets = [];
  foreignAssets.push(reward_address);
  let revocationTarget = undefined;
  let closeRemainderTo = undefined;
  let note = undefined;

  let action = "add_reward";
  let reward_amount = Number(rewardAmount);
  let withdrawble_amount = Number(withdrawableAmount);

  let appArgs = [];
  appArgs.push(new Uint8Array(Buffer.from(action)));
  appArgs.push(algosdk.encodeUint64(reward_amount));
  appArgs.push(algosdk.encodeUint64(withdrawble_amount));

  // Transaction to stake token
  let txnReward = algosdk.makeAssetTransferTxnWithSuggestedParams(
    sender,
    smartContract,
    closeRemainderTo,
    revocationTarget,
    reward_amount,
    note,
    reward_address,
    suggestedParams
  );
  // console.log(txnStake)
  // create unsigned transaction
  let txnCall = algosdk.makeApplicationNoOpTxn(
    sender,
    suggestedParams,
    index,
    appArgs
  );
  // console.log(txn)
  // Group the paymntTransferStakte Txn and AppCall
  let txnGroup = [txnReward, txnCall];

  // Group them

  let txGroup = algosdk.assignGroupID(txnGroup);
  console.log(txGroup);
  // Sign each transaction
  // Sign each transaction in the group
  signedTx1 = txnReward.signTxn(creatorAccount.sk);
  signedTx2 = txnCall.signTxn(creatorAccount.sk);

  // Assemble transaction group

  let signed = [];
  signed.push(signedTx1);
  signed.push(signedTx2);

  // submit transaction
  let tx = await algodClient.sendRawTransaction(signed).do();
  // let txId = tx.txId;
  console.log("Transaction : " + tx.txId);

  // Wait for transaction to be confirmed
  await waitForConfirmation(algodClient, tx.txId, 5);

  // // get tx ID
  // let txId = txn.txID().toString();
  // console.log("NoOp Tx ID: ", txId);

  // // sign transaction
  // let signedTxn = txn.signTxn(userAccount.sk);
  // console.log("NoOp signed Txn: ", signedTxn);

  // // submit the transaction
  // let response = await algodClient.sendRawTransaction(signedTxn).do();
  // console.log("Raw transaction submitted: ", response);

  // // wait for the transaction confirmation
  // let timeout = 4;
  // await waitForConfirmation(algodClient, txId, timeout);

  // response display
  let transactionResponse = await algodClient
    .pendingTransactionInformation(tx.txId)
    .do();
  console.log(transactionResponse);
  console.log(
    "Reward Added to the Contract [AssetID]: ",
    transactionResponse["txn"]["txn"]["xaid"]
  );

  if (transactionResponse["global-state-delta"] !== undefined) {
    console.log(
      "Global State updated:",
      transactionResponse["global-state-delta"]
    );
  }
  if (transactionResponse["local-state-delta"] !== undefined) {
    console.log(
      "Local State updated:",
      transactionResponse["local-state-delta"]
    );
  }
}

async function deployStorageApp() {
  // ADMIN
  // creatorMnemonic =
  //   "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
  let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  let sender = creatorAccount.addr;

  // Setup AlgodClient Connection
  // const algodToken =
  //   "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  // const algodServer = "http://3.145.206.208";
  // const algodPort = 4001;
  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  // get node suggested parameters (sp)
  let suggestedParams = await algodClient.getTransactionParams().do();
  // comment out the next two lines to use suggested fee
  suggestedParams.fee = 5000;
  suggestedParams.flatFee = true;

  let appArgs = [];
  accounts = [];
  foreignApps = [];
  foreignAssets = [];

  // declare application state storage (immutable)
  localInts = 1;
  localBytes = 1;
  globalInts = 1;
  globalBytes = 1;

  // Get ByteCode of Approval Program
  let approvalProgram = await readApprovalTeal(true);
  console.log(approvalProgram);
  // console.log("Approval Program ByteCode: ",approvalProgram);

  // Get ByteCode of ClearState Program
  let clearProgram = await readClearTeal();
  // console.log("Clear Program ByteCode: ",clearProgram);

  // declare onComplete as NoOp to execute the SmartContract
  onComplete = algosdk.OnApplicationComplete.NoOpOC;

  // create unsigned transaction
  let txn = algosdk.makeApplicationCreateTxn(
    sender,
    suggestedParams,
    onComplete,
    approvalProgram,
    clearProgram,
    localInts,
    localBytes,
    globalInts,
    globalBytes,
    appArgs,
    accounts,
    foreignApps,
    foreignAssets
  );

  // console.log(txn);

  // to fetch the txn ID
  let txId = txn.txID().toString();
  console.log(txId);

  // Sign Transaction
  let signedTxn = txn.signTxn(creatorAccount.sk);
  console.log("Signed Transaction with txID: ", signedTxn);

  // submit the transaction
  let response = await algodClient.sendRawTransaction(signedTxn).do();
  console.log(response);

  // wait for confirmation
  let timeout = 10;
  let check = await waitForConfirmation(algodClient, txId, timeout);
  console.log(check);
  // display results
  let txResponse = await algodClient.pendingTransactionInformation(txId).do();

  let appID = txResponse["application-index"];

  console.log("Deployed a smartContract on Algorand: ", appID);
  return appID;
}
module.exports = {
  deployStorageApp,
  deployContract,
  setup,
  addReward,
};
