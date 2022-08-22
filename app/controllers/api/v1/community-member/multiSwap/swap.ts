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

    req.query.bridgeContractAddress = fromNetwork.contractAddress;

    if (address && fromNetwork && fromCabn && toNetwork && toCabn) {

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
      return res.http400('bridgeContractAddress & fromCabnId & fromNetworkId & amount & toCabnId & toNetworkId  are required.');
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
    req.query.bridgeContractAddress = fromNetwork.contractAddress;

    if (address && fromNetwork && fromCabn && toNetwork && toCabn) {
      await contractHelper.doSwapAndGetTransactionPayload(address, fromNetwork, fromCabn, req.query.bridgeContractAddress, req.query.amount, toNetwork, toCabn, res, false);
    } else {
      return res.http400('Invalid fromCabnId, fromNetworkId, toCabnId or toNetworkId');
    }

  }));

  router.get('/verify/transaction/and/generate/signature/:txId', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;
    let fromCabn = null;
    let toNetwork = null;
    let toCabn = null;
    let data = null;

    if (!req.query.bridgeContractAddress && !req.params.txId && !req.query.fromNetworkId) {
      return res.http400('bridgeContractAddress & txId & fromNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)) {
      return res.http400('Invalid fromNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id });
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId });
    // fromCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.fromCabnId }).populate('currency')

    // toNetwork = await db.Networks.findOne({ _id: req.query.toNetworkId })
    // toCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.toCabnId }).populate('currency')

    if (address && fromNetwork) {

      let transaction = await swapTransactionHelper.getTransactionReceiptByTxIdUsingWeb3(fromNetwork, req.params.txId,req.query.bridgeContractAddress);
    //   ValidationUtils.isTrue(tx.status, `Transaction "${txId}" is failed`);
		// ValidationUtils.isTrue(ChainUtils.addressesAreEqual(network as Network, address, tx.to),
		// 	'Transaction is not against the bridge contract');
    // ValidationUtils.isTrue(!!swapLog, 'No swap log found on tx ' + txId)

      console.log(transaction)

    } else {
      // change this error message
      return res.http400('Invalid txId or fromNetworkId');
    }

  }));

};
