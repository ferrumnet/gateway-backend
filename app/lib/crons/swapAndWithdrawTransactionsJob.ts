export { }
const LIMIT = 100;
const DELAY = 120000;

module.exports = function () {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForSwapAndWithdrawTransactionsJob === 'no') {
    start();
  }
}

async function start() {

  try {
    console.log('swapAndWithdrawTransactionsJob cron triggered:::')
    console.log(new Date());
    triggerJobs(0);
  } catch (e) {
    console.log(e);
  }

}

async function triggerJobs(offset: any) {
  let filter: any = {}
  filter.$or = [
    { status: { $eq: utils.swapAndWithdrawTransactionStatuses.swapPending } },
    { status: { $eq: utils.swapAndWithdrawTransactionStatuses.swapCompleted } },
  ]
  let transactions = await db.SwapAndWithdrawTransactions.find(filter)
    .populate('sourceNetwork').populate('destinationNetwork')
    .populate('sourceCabn').populate('destinationCabn')
    .skip(offset)
    .limit(LIMIT);
  console.log('transactions', transactions.length);
  if (transactions && transactions.length > 0) {
    for (let i = 0; i < transactions.length; i++) {
      let req: any = {};
      req.query = {}
      let user: any = {}
      let transaction = transactions[i];
      req.swapTxId = transaction.receiveTransactionId;
      req.sourceNetwork = transaction.sourceNetwork;
      req.destinationNetwork = transaction.destinationNetwork;
      req.query.bridgeAmount = transaction.bridgeAmount ? transaction.bridgeAmount : 0;
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
}

function delay(ms: any) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}