import moment from "moment";
import fs from "fs";
import axios from "axios";
import {
  waitForConfirmation,
  default as algosdk,
  ALGORAND_MIN_TX_FEE,
} from "algosdk";
require("dotenv").config();

async function deployContract(
  tokenAddress: any,
  rewardTokenAddress: any,
  stakingCapital: any,
  stakingStarts: any,
  stakingEnds: any,
  withdrawStarts: any,
  withdrawEnds: any,
  stakingId: any,
  storageAppId: any
) {
  const algodPort = "";
  const algodToken = JSON.parse((global as any).environment.algodToken);
  const algodServer = (global as any).environment.algodServer;
  const creatorMnemonic = (global as any).environment.creatorMnemonic;
  let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  let sender = creatorAccount.addr;
  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  let suggestedParams = await algodClient.getTransactionParams().do();
  let token_address = Number(tokenAddress);
  let reward_address = Number(rewardTokenAddress);
  let staking_total = Number(stakingCapital);
  let total_supply = 1000000;
  let storage_app_id = Number(storageAppId);

  // console.log(stakingStarts);
  // console.log(stakingEnds);
  // console.log(withdrawStarts);
  // console.log(withdrawEnds);
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
  var accounts: any = [];
  var foreignApps: any = [];
  foreignApps.push(storage_app_id);
  var foreignAssets: any = [];
  foreignAssets.push(token_address);
  foreignAssets.push(reward_address);

  // declare application state storage (immutable)
  var localInts = 4;
  var localBytes = 4;
  var globalInts = 20;
  var globalBytes = 5;

  // Get ByteCode of Approval Program
  let approvalProgram = await readApprovalTeal(false);
  // console.log("Approval Program ByteCode: ",approvalProgram);

  // Get ByteCode of ClearState Program
  let clearProgram = await readClearTeal();
  // console.log("Clear Program ByteCode: ",clearProgram);

  // declare onComplete as NoOp to execute the SmartContract
  var onComplete = algosdk.OnApplicationComplete.NoOpOC;

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
    `${(global as any).environment.algorandParserScriptUrl}/algorand/${appId}`
  );
  return { appId, encodedAddress: encodedAddress.data.contractAddress };
}
async function readApprovalTeal(isStorageApp: any) {
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
  var clearProgramSource = `#pragma version 4
    int 1
    `;
  var content = await getCompiledResult(clearProgramSource);
  return content;
}

async function getCompiledResult(data: any) {
  let compiledSource = await compileTEAL(data);
  return compiledSource;
}

async function compileTEAL(content: any) {
  const algodPort = "";
  const algodToken = JSON.parse((global as any).environment.algodToken);
  const algodServer = (global as any).environment.algodServer;
  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  // Read Teal from Content
  let programSource = content;

  // compile program to binary
  let compiledSource = await compileProgram(algodClient, programSource);

  return compiledSource;
}
// to compile program source (TEAL) to Bytecode
async function compileProgram(algodClient: any, programSource: any) {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algodClient.compile(programBytes).do();
  let compileBytes = new Uint8Array(
    Buffer.from(compileResponse.result, "base64")
  );
  return compileBytes;
}
async function setup(tokenAddress: any, rewardTokenAddress: any, appId: any) {
  const algodPort = "";
  const algodToken = JSON.parse((global as any).environment.algodToken);
  const algodServer = (global as any).environment.algodServer;
  const creatorMnemonic = (global as any).environment.creatorMnemonic;

  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  let sender = creatorAccount.addr;
  // get node suggested parameters (sp)
  let suggestedParams = await algodClient.getTransactionParams().do();
  suggestedParams.fee = 5000;
  let index = Number(appId);
  // let token_address = 66863719;
  let token_address = Number(tokenAddress);
  let reward_address = Number(rewardTokenAddress);
  // let reward_address = Number(stakingCapital);
  var account: any = [];
  var foreignApp: any = [];
  var foreignAssets: any = [];
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
  rewardTokenAddress: any,
  encodedAddress: any,
  rewardAmount: any,
  withdrawableAmount: any,
  appId: any
) {
  // console.log("---" + encodedAddress.replace(/\s/g, "") + "---");
  // Setup AlgodClient Connection
  const algodPort = "";
  const algodToken = JSON.parse((global as any).environment.algodToken);
  const algodServer = (global as any).environment.algodServer;
  const creatorMnemonic = (global as any).environment.creatorMnemonic;
  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  let sender = creatorAccount.addr;

  let smartContract = encodedAddress.replace(/\s/g, "");

  // get node suggested parameters (sp)
  let suggestedParams = await algodClient.getTransactionParams().do();
  suggestedParams.fee = ALGORAND_MIN_TX_FEE;
  let index = Number(appId);

  // Arguments to be passed in App Call
  let reward_address = Number(rewardTokenAddress);
  // let reward_address = 66863719;
  // let reward_address = 77861997;
  // var account: any = [];
  // var foreignApp = [];
  var foreignAssets = [];
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
  var signedTx1 = txnReward.signTxn(creatorAccount.sk);
  var signedTx2 = txnCall.signTxn(creatorAccount.sk);

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
  const algodPort = "";
  const algodToken = JSON.parse((global as any).environment.algodToken);
  const algodServer = (global as any).environment.algodServer;
  const creatorMnemonic = (global as any).environment.creatorMnemonic;
  let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  let sender = creatorAccount.addr;
  let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  // get node suggested parameters (sp)
  let suggestedParams = await algodClient.getTransactionParams().do();
  // comment out the next two lines to use suggested fee
  suggestedParams.fee = 5000;
  suggestedParams.flatFee = true;

  let appArgs: any = [];
  var accounts: any = [];
  var foreignApps: any = [];
  var foreignAssets: any = [];

  // declare application state storage (immutable)
  var localInts = 1;
  var localBytes = 1;
  var globalInts = 1;
  var globalBytes = 1;

  // Get ByteCode of Approval Program
  let approvalProgram = await readApprovalTeal(true);
  console.log(approvalProgram);
  // console.log("Approval Program ByteCode: ",approvalProgram);

  // Get ByteCode of ClearState Program
  let clearProgram = await readClearTeal();
  // console.log("Clear Program ByteCode: ",clearProgram);

  // declare onComplete as NoOp to execute the SmartContract
  var onComplete = algosdk.OnApplicationComplete.NoOpOC;

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
