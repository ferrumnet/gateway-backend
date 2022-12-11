var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.post('/create/:txId', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let sourceNetwork = null;
    let swapTransaction = null;

    if (!req.params.txId || !req.query.sourceNetworkId) {
      return res.http400('txId & sourceNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)) {
      return res.http400('Invalid sourceNetworkId');
    }

    let oldSwapTransaction = await db.SwapAndWithdrawTransactions.findOne({receiveTransactionId: req.params.txId});
    if(oldSwapTransaction){
      return res.http200({
        swapAndWithdrawTransaction: oldSwapTransaction
      })
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id });
    }

    sourceNetwork = await db.Networks.findOne({ _id: req.query.sourceNetworkId });

    if(sourceNetwork){
      req.query.smartContractAddress = await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(sourceNetwork._id, '#fiberFund');
    }

    if (address && req.query.smartContractAddress) {
      let receipt = await swapTransactionHelper.getTransactionReceiptByTxIdUsingWeb3(sourceNetwork, req.params.txId, req.query.smartContractAddress);
      
      if(receipt.code == 401){
        return res.http400(await commonFunctions.getValueFromStringsPhrase(receipt.message), receipt.message);
      }else if (receipt.code == 400){
        return res.http400(receipt.message);
      }

      receipt = receipt.data;
      if (receipt) {
        receipt.sourceSmartContractAddress = req.query.smartContractAddress;
        swapTransaction = await swapTransactionHelper.swapTransactionSummary(receipt, utils.expectedSchemaVersionV1_0);
        console.log('come here')
      }

      if(swapTransaction ){
        swapTransaction.sourceNetwork = receipt.fromNetwork._id;
        swapTransaction.destinationNetwork = receipt.toNetwork._id;
        swapTransaction.destinationCabn = (await db.CurrencyAddressesByNetwork.findOne({tokenContractAddress: req.query.sourceTokenContractAddress}))._id;
        swapTransaction.sourceCabn = (await db.CurrencyAddressesByNetwork.findOne({tokenContractAddress: req.query.destinationTokenContractAddress}))._id;
        swapTransaction.createdByUser = req.user._id;
        swapTransaction.createdAt = new Date();
        swapTransaction.updatedAt = new Date();
        swapTransaction = await db.SwapAndWithdrawTransactions.create(swapTransaction);
        return res.http200({
          swapAndWithdrawTransaction: swapTransaction
        })
      }


      // console.log('swapTransaction', swapTransaction);
      // let hash = signatureHelper.bridgeHashV1_0(swapTransaction, swap);
      // console.log('final hash', hash);
      // let msgHash = hash.replace('0x', '');
      // let signatureResponse = await ecdsaHelper.sign('915c8bf73c84c0482beef48bb4bf782892d38d57d3c9af32de6af27a54d12c5a', msgHash);
      // console.log(signatureResponse);
      // let withdrawSigned = await contractHelper.withdrawSigned(address, swapTransaction, swap.toNetwork, '0x544db7e44d73761c00cfc4525c38f896bd20b69fb8487ba12f2a21af013502d565d02ade27351679f16c832cc1eaf6202a831ad2ecec47fbf2fbfe4a70bafcb11c');
      // console.log(withdrawSigned);
    }

    return res.http400('Invalid txId, sourceNetwork or smartContractAddress');

  }));

  router.get('/list', asyncMiddleware(async (req: any, res: any) => {

    var filter: any = {}
    let sort = {createdAt: -1 };
    let transactions = null;
    let totalCount = 0;

    filter.createdByUser = req.user._id;

    if(req.query.sourceNetwork){
      filter.sourceNetwork = req.query.sourceNetwork;
    }

    totalCount = await db.SwapAndWithdrawTransactions.countDocuments(filter);

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      transactions = await db.SwapAndWithdrawTransactions.find(filter)
      .populate('destinationNetwork')
      .populate('sourceNetwork')
      .populate({
        path: 'toCabn',
        populate: {
          path: 'currency',
          model: 'currencies'
        }
      })
      .populate({
        path: 'fromCabn',
        populate: {
          path: 'currency',
          model: 'currencies'
        }
      })
      .sort(sort)
    }else {
      transactions = await db.SwapAndWithdrawTransactions.find(filter).populate('networks')
      .populate('destinationNetwork')
      .populate('sourceNetwork')
      .populate({
        path: 'destinationCabn',
        populate: {
          path: 'currency',
          model: 'currencies'
        }
      })
      .populate({
        path: 'sourceCabn',
        populate: {
          path: 'currency',
          model: 'currencies'
        }
      })
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }

    return res.http200({
      swapAndWithdrawTransactions: transactions,
      totalCount: totalCount
    });

  }));

  router.get('/:txId', asyncMiddleware(async (req: any, res: any) => {

    var filter: any = {}
    let sort = {createdAt: -1 };
    let transactions = null;

    filter.receiveTransactionId = req.params.txId;

    transactions = await db.SwapAndWithdrawTransactions.findOne(filter)
      .populate('destinationNetwork')
      .populate('sourceNetwork')
      .populate({
        path: 'destinationCabn',
        populate: {
          path: 'currency',
          model: 'currencies'
        }
      })
      .populate({
        path: 'sourceCabn',
        populate: {
          path: 'currency',
          model: 'currencies'
        }
      })

    return res.http200({
      swapAndWithdrawTransaction: transactions
    });

  }));

  router.get('/info/statuses', asyncMiddleware(async (req: any, res: any) => {

    var filter: any = {}
    let swapPendingCount = 0;
    let swapCreatedCount = 0;
    let swapCompletedCount = 0;
    let swapFailedCount = 0;
    let swapWithdrawGeneratedCount = 0;
    let swapWithdrawPendingCount = 0;
    let swapWithdrawFailedCount = 0;
    let swapWithdrawCompletedCount = 0;

    filter.createdByUser = req.user._id;

    if(req.query.sourceNetwork){
      filter.sourceNetwork = req.query.sourceNetwork;
    }
    
    swapPendingCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapPending'});
    swapCreatedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapCreated'});
    swapCompletedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapCompleted'});
    swapFailedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapFailed'});
    swapWithdrawGeneratedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapWithdrawGenerated'});
    swapWithdrawPendingCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapWithdrawPending'});
    swapWithdrawFailedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapWithdrawFailed'});
    swapWithdrawCompletedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapWithdrawCompleted'});

    return res.http200({
      swapPendingCount,
      swapCreatedCount,
      swapCompletedCount,
      swapFailedCount,
      swapWithdrawGeneratedCount,
      swapWithdrawPendingCount,
      swapWithdrawFailedCount,
      swapWithdrawCompletedCount
    });

  }));

  router.put('/update/status/:txId', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let sourceNetwork = null;
    let destinationNetwork = null;

    if (!req.params.txId || !req.body.withdrawTxId) {
      return res.http400('txId and withdrawTxId required.');
    }

    let oldSwapTransaction = await db.SwapAndWithdrawTransactions.findOne({receiveTransactionId: req.params.txId}).populate('sourceNetwork').populate('destinationNetwork');

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id });
    }

    sourceNetwork = oldSwapTransaction.sourceNetwork;
    destinationNetwork = oldSwapTransaction.destinationNetwork;

    if(sourceNetwork){
      req.query.smartContractAddress = await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(sourceNetwork._id, '#fiberFund');
    }

    if (address && sourceNetwork && oldSwapTransaction && req.query.smartContractAddress) {
      let receipt = await swapTransactionHelper.getTransactionReceiptStatusByTxIdUsingWeb3(destinationNetwork, req.body.withdrawTxId, req.query.smartContractAddress);
  
      if(receipt.code == 401){
        return res.http400(await commonFunctions.getValueFromStringsPhrase(receipt.message), receipt.message);
      }else if (receipt.code == 400){
        return res.http400(receipt.message);
      }
      console.log(receipt);
      receipt = receipt.data;

      if(receipt.status == 'swapWithdrawFailed'){
        oldSwapTransaction.status = 'swapWithdrawFailed'
      }else if(receipt.status == 'swapWithdrawCompleted'){
        oldSwapTransaction.status = 'swapWithdrawCompleted'
      }else {
        oldSwapTransaction.status = 'swapWithdrawPending'
      }

      let useTransaction = {
        transactionId: req.body.withdrawTxId,
        status: receipt.status,
        timestamp: new Date()
      }

      if(oldSwapTransaction.useTransactions && oldSwapTransaction.useTransactions.length > 0){
        let txItem = (oldSwapTransaction.useTransactions || []).find((t:any) => t.transactionId === req.body.withdrawTxId);
        if(!txItem){
          oldSwapTransaction.useTransactions.push(useTransaction);
        }
      }else {
        oldSwapTransaction.useTransactions.push(useTransaction);
      }

      await db.SwapAndWithdrawTransactions.findOneAndUpdate({_id: oldSwapTransaction._id}, oldSwapTransaction);

      return res.http200({
        swapAndWithdrawTransaction: oldSwapTransaction
      })
    }

    return res.http400('Invalid txId, withdrawTxId or smartContractAddress');

  }));

};
