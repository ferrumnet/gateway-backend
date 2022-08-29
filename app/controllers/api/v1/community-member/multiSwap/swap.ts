var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/get/from/gas/estimation', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;
    let fromCabn = null;
    let toNetwork = null;
    let toCabn = null;
    let data = null;

    if (!req.query.fromCabnId || !req.query.fromNetworkId || !req.query.amount || !req.query.toCabnId || !req.query.toNetworkId) {
      return res.http400('fromCabnId & fromNetworkId & amount & toCabnId & toNetworkId  are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromCabnId) || !mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)
      || !mongoose.Types.ObjectId.isValid(req.query.toCabnId) || !mongoose.Types.ObjectId.isValid(req.query.toNetworkId)) {
      return res.http400('Invalid fromCabnId, fromNetworkId, toCabnId or toNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId })
    fromCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.fromCabnId }).populate('currency')

    toNetwork = await db.Networks.findOne({ _id: req.query.toNetworkId })
    toCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.toCabnId }).populate('currency')

    if (address && fromNetwork && fromCabn && toNetwork && toCabn) {
      req.query.bridgeContractAddress = fromNetwork.contractAddress;
      await contractHelper.doSwapAndGetTransactionPayload(address, fromNetwork, fromCabn, req.query.bridgeContractAddress, req.query.amount, toNetwork, toCabn, res, true);
    } else {
      return res.http400('Invalid fromCabnId, fromNetworkId, toCabnId or toNetworkId');
    }

  }));

  router.get('/create/to/get/payload', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;
    let fromCabn = null;
    let toNetwork = null;
    let toCabn = null;
    let data = null;

    if (!req.query.fromCabnId || !req.query.fromNetworkId || !req.query.amount || !req.query.toCabnId || !req.query.toNetworkId) {
      return res.http400('fromCabnId & fromNetworkId & amount & toCabnId & toNetworkId  are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromCabnId) || !mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)
      || !mongoose.Types.ObjectId.isValid(req.query.toCabnId) || !mongoose.Types.ObjectId.isValid(req.query.toNetworkId)) {
      return res.http400('Invalid fromCabnId, fromNetworkId, toCabnId or toNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId })
    fromCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.fromCabnId }).populate('currency')

    toNetwork = await db.Networks.findOne({ _id: req.query.toNetworkId })
    toCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.toCabnId }).populate('currency')

    if (address && fromNetwork && fromCabn && toNetwork && toCabn) {
      req.query.bridgeContractAddress = fromNetwork.contractAddress;
      await contractHelper.doSwapAndGetTransactionPayload(address, fromNetwork, fromCabn, req.query.bridgeContractAddress, req.query.amount, toNetwork, toCabn, res, false);
    } else {
      return res.http400('Invalid fromCabnId, fromNetworkId, toCabnId or toNetworkId');
    }

  }));

  router.get('/verify/transaction/and/generate/signature/:txId', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;

    if (!req.params.txId && !req.query.fromNetworkId) {
      return res.http400('txId & fromNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)) {
      return res.http400('Invalid fromNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id });
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId });

    if (address && fromNetwork) {
      req.query.bridgeContractAddress = fromNetwork.contractAddress;
      let transactionResponse = await swapTransactionHelper.getTransactionReceiptByTxIdUsingWeb3(fromNetwork, req.params.txId, req.query.bridgeContractAddress);
      if (transactionResponse && transactionResponse.code == 400) {
        return res.http400(await commonFunctions.getValueFromStringsPhrase(transactionResponse.data), transactionResponse.data);
      } else if (transactionResponse && transactionResponse.code == 401) {
        return res.http400('Invalid txId or fromNetworkId');
      }
      let swap = transactionResponse.data;
      let swapTransaction = null;
      console.log('swap', swap);
      if (swap) {
        swapTransaction = await swapTransactionHelper.swapTransactionHelper(swap, utils.expectedSchemaVersionV1_0);
      }
      console.log('swapTransaction', swapTransaction);
      let hash = signatureHelper.bridgeHashV1_0(swapTransaction, swap);
      console.log('final hash', hash);
      let msgHash = hash.replace('0x', '');
      let signatureResponse = ecdsaHelper.sign('a7d08a23f69090a53a32814da1d262c8d2728d16bce420ae143978d85a06be49', msgHash);
      console.log(signatureResponse);
      return res.http200({
        // transaction: transactionResponse,
        swapTransaction: swapTransaction
      })
    } else {
      return res.http400('Invalid txId or fromNetworkId');
    }

  }));

};
