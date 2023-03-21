var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.put('/update/swap/and/withdraw/job/:txHash', asyncMiddleware(async (req: any, res: any) => {

    commonFunctions.doAuthForNodeApis(req);

    if (!req.params.txHash && req.body.signedData) {
      return res.http400('txHash & signedData are required.');
    }

    if(req.body.signatures && req.body.signatures.length == 0){
      return res.http401('signatures can not be empty');
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
      swapAndWithdrawTransaction = getSignedData(swapAndWithdrawTransaction, req.body.signedData);
      swapAndWithdrawTransaction.nodeJob.updatedAt = new Date();
      swapAndWithdrawTransaction.updatedAt = new Date();
      swapAndWithdrawTransaction = await db.SwapAndWithdrawTransactions.findOneAndUpdate({ _id: swapAndWithdrawTransaction._id }, swapAndWithdrawTransaction, { new: true });
    }
    return res.http200({
      message: stringHelper.strSuccess
    });

  }));

  function getSignedData(swapAndWithdrawTransaction: any,  signedData: any){

    swapAndWithdrawTransaction.payBySig.salt = signedData.salt;
    swapAndWithdrawTransaction.payBySig.hash = signedData.hash;
    swapAndWithdrawTransaction.payBySig.signatures = signedData.signatures;

    return swapAndWithdrawTransaction;
  }

};
