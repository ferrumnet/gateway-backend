var mongoose = require('mongoose');

module.exports = function (router: any) {
  
  router.post('/do/swap/and/withdraw/:swapTxId', async (req: any, res: any) => {

    swapTransactionHelper.validationForDoSwapAndWithdraw(req);
    req.sourceNetwork = await db.Networks.findOne({ _id: req.query.sourceNetworkId });
    req.destinationNetwork = await db.Networks.findOne({ _id: req.query.destinationNetworkId });
    if(!req.sourceNetwork || !req.destinationNetwork){
      throw 'Invalid sourceNetwork or destinationNetwork';
    }
    let swapAndWithdrawTransaction = await swapTransactionHelper.createPendingSwap(req);
    swapAndWithdrawTransaction = await swapTransactionHelper.doSwapAndWithdraw(req, swapAndWithdrawTransaction);
    return res.http200({
      swapAndWithdrawTransaction: swapAndWithdrawTransaction
    })
  });

};
