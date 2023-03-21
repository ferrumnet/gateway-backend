var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.put('/update/swap/and/withdraw/job/:txHash', asyncMiddleware(async (req: any, res: any) => {

    commonFunctions.doAuthForNodeApis(req);

    if (!req.params.txHash) {
      return res.http400('txHash is required.');
    }
    console.log('update swapAndWitdraw body', req.body);
    if(req.body.signedData){
      console.log('update swapAndWitdraw body signedData', req.body.signedData);
    }

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
