var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.post('/create/:txId', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;
    let swapTransaction = null;

    if (!req.params.txId && !req.query.fromNetworkId) {
      return res.http400('txId & fromNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)) {
      return res.http400('Invalid fromNetworkId');
    }

    let oldSwapTransaction = await db.SwapAndWithdrawTransactions.findOne({receiveTransactionId: req.params.txId});
    if(oldSwapTransaction){
      return res.http200({
        swapTransaction: swapTransaction
      })
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id });
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId });

    if (address && fromNetwork) {
      req.query.bridgeContractAddress = fromNetwork.contractAddress;
      let receipt = await swapTransactionHelper.getTransactionReceiptByTxIdUsingWeb3(fromNetwork, req.params.txId, req.query.bridgeContractAddress);
  
      if(receipt.code == 401){
        return res.http400(await commonFunctions.getValueFromStringsPhrase(receipt.message), receipt.message);
      }else if (receipt.code == 400){
        return res.http400(receipt.message);
      }

      receipt = receipt.data;
      if (receipt) {
        swapTransaction = await swapTransactionHelper.swapTransactionSummary(receipt, utils.expectedSchemaVersionV1_0);
      }

      if(swapTransaction ){
        swapTransaction.fromNetwork = receipt.fromNetwork._id;
        swapTransaction.toNetwork = receipt.toNetwork._id;
        swapTransaction.toCabn = (await db.CurrencyAddressesByNetwork.findOne({tokenContractAddress: receipt.toCabn.tokenContractAddress}))._id;
        swapTransaction.fromCabn = (await db.CurrencyAddressesByNetwork.findOne({tokenContractAddress: receipt.fromCabn.tokenContractAddress}))._id;
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

    return res.http400('Invalid txId or fromNetworkId');

  }));

  router.get('/list', asyncMiddleware(async (req: any, res: any) => {

    var filter: any = {}
    let sort = {createdAt: -1 };
    let transactions = null;

    filter.createdByUser = req.user._id;

    if(req.query.fromNetwork){
      filter.fromNetwork = req.query.fromNetwork;
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      transactions = await db.SwapAndWithdrawTransactions.find(filter)
      .populate('toNetwork')
      .populate('fromNetwork')
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
      .populate('toNetwork')
      .populate('fromNetwork')
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
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }

    return res.http200({
      swapAndWithdrawTransactions: transactions
    });

  }));

  router.get('/:txId', asyncMiddleware(async (req: any, res: any) => {

    var filter: any = {}
    let sort = {createdAt: -1 };
    let transactions = null;

    filter.receiveTransactionId = req.params.txId;

    transactions = await db.SwapAndWithdrawTransactions.findOne(filter)
      .populate('toNetwork')
      .populate('fromNetwork')
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
    let swapWIthdrawCompletedCount = 0;

    filter.createdByUser = req.user._id;

    if(req.query.fromNetwork){
      filter.fromNetwork = req.query.fromNetwork;
    }
    
    swapPendingCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapPending'});
    swapCreatedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapCreated'});
    swapCompletedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapCompleted'});
    swapFailedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapFailed'});
    swapWithdrawGeneratedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapWithdrawGenerated'});
    swapWIthdrawCompletedCount = await db.SwapAndWithdrawTransactions.countDocuments({...filter, status: 'swapWIthdrawCompleted'});

    return res.http200({
      swapPendingCount,
      swapCreatedCount,
      swapCompletedCount,
      swapFailedCount,
      swapWithdrawGeneratedCount,
      swapWIthdrawCompletedCount
    });

  }));

};
