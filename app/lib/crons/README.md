# swapAndWithdrawTransactionsJob.ts

### 1\. Main module export function

This function initializes the cron job, checking if the environment supports the "Swap and Withdraw Transactions Job". If supported, it calls the `start` function to begin the job.

typescript

Copy code

`module.exports = function () {
  if (global.starterEnvironment.isCronEnvironmentSupportedForSwapAndWithdrawTransactionsJob === "no") {
    start();
  }
};`

### 2\. `start()` function

This asynchronous function logs the trigger of the `swapAndWithdrawTransactionsJob` cron and then calls `triggerJobs(0)` to start processing transactions based on specific conditions and configurations.

typescript

Copy code

`async function start() {
  try {
    console.log("swapAndWithdrawTransactionsJob cron triggered:::");
    console.log(new Date());
    triggerJobs(0);
  } catch (e) {
    console.log(e);
  }
}`

### 3\. `triggerJobs(offset: any)` function

This asynchronous function is responsible for fetching and processing swap and withdraw transactions. It defines a filter to fetch transactions that meet certain status criteria and are of version "v3". It processes each transaction by calling `swapTransactionHelper.doSwapAndWithdraw` for each transaction and recursively triggers itself to handle pagination.

typescript

Copy code

`async function triggerJobs(offset: any) {
  let filter: any = {};
  filter.$or = [
    { status: { $eq: utils.swapAndWithdrawTransactionStatuses.swapPending } },
    { status: { $eq: utils.swapAndWithdrawTransactionStatuses.generatorSignatureCreated } },
    { status: { $eq: utils.swapAndWithdrawTransactionStatuses.validatorSignatureCreated } },
    { status: { $eq: utils.swapAndWithdrawTransactionStatuses.swapCompleted } },
  ];
  filter.version = "v3";
  let transactions = await db.SwapAndWithdrawTransactions.find(filter)
    .populate("sourceCabn")
    .populate("destinationCabn")
    .populate({
      path: "destinationNetwork",
      populate: {
        path: "multiswapNetworkFIBERInformation",
        model: "multiswapNetworkFIBERInformations",
      },
    })
    .populate({
      path: "sourceNetwork",
      populate: {
        path: "multiswapNetworkFIBERInformation",
        model: "multiswapNetworkFIBERInformations",
      },
    })
    .skip(offset)
    .limit(LIMIT);
  console.log("transactions", transactions.length);
  if (transactions && transactions.length > 0) {
    for (let i = 0; i < transactions.length; i++) {
      let req: any = {};
      req.query = {};
      let user: any = {};
      let transaction = transactions[i];
      req.swapTxId = transaction.receiveTransactionId;
      req.sourceNetwork = transaction.sourceNetwork;
      req.destinationNetwork = transaction.destinationNetwork;
      req.query.sourceBridgeAmount = transaction.sourceBridgeAmount
        ? transaction.sourceBridgeAmount
        : 0;
      req.query.destinationAmountIn = transaction.destinationAmountIn
        ? transaction.destinationAmountIn
        : 0;
      user._id = transaction.createdByUser;
      req.user = user;
      await swapTransactionHelper.doSwapAndWithdraw(req, transaction);
    }
  }
  if (transactions && transactions.length < LIMIT) {
    await delay(DELAY);
    triggerJobs(0);
  } else {
    offset += LIMIT;
    triggerJobs(offset);
  }
}`

### 4\. `delay(ms: any)` function

This function is a utility to create a delay, used to throttle the recursive calling of `triggerJobs`.

typescript

Copy code

`function delay(ms: any) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}`
