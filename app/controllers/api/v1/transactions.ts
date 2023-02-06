var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/receipt/by/hash/:txId', asyncMiddleware(async (req: any, res: any) => {

    let sourceNetwork = null;

    if (!req.params.txId || !req.query.sourceNetworkId) {
      return res.http400('txId & sourceNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)) {
      return res.http400('Invalid sourceNetworkId');
    }

    sourceNetwork = await db.Networks.findOne({ _id: req.query.sourceNetworkId });

    return res.http200({
      receipt: await swapTransactionHelper.getTransactionReceiptReceiptForApi(sourceNetwork, req.params.txId)
    })
  }));

  router.put('/update/swap/and/withdraw/job/:txHash', asyncMiddleware(async (req: any, res: any) => {

    if (!req.params.txHash) {
      return res.http400('txHash is required.');
    }
    console.log('update swapAndWitdraw body', req.body);
    let swapAndWithdrawTransaction = await db.SwapAndWithdrawTransactions.findOne({ receiveTransactionId: req.params.txHash })
      .populate('sourceNetwork').populate('destinationNetwork')
      .populate('sourceCabn').populate('destinationCabn');

    if (req.body && swapAndWithdrawTransaction) {
      let transaction = req.body.transaction;
      let transactionReceipt = req?.body?.transactionReceipt;
      swapAndWithdrawTransaction.nodeJob.status = utils.swapAndWithdrawTransactionJobStatuses.completed;
     
      if (transactionReceipt?.status && transactionReceipt?.status == true) {
        swapAndWithdrawTransaction.status = utils.swapAndWithdrawTransactionStatuses.swapCompleted;
      } else {
        swapAndWithdrawTransaction.status = utils.swapAndWithdrawTransactionStatuses.swapFailed;
      }

      if (transaction) {
        swapAndWithdrawTransaction = await swapTransactionHelper.filterTransactionDetail(swapAndWithdrawTransaction, transaction);
      }
      
      swapAndWithdrawTransaction.nodeJob.updatedAt = new Date();
      swapAndWithdrawTransaction.updatedAt = new Date();
      swapAndWithdrawTransaction = await db.SwapAndWithdrawTransactions.findOneAndUpdate({ _id: swapAndWithdrawTransaction._id }, swapAndWithdrawTransaction, { new: true });
    }
    return res.http200({
      message: stringHelper.strSuccess
    });

  }));

};
