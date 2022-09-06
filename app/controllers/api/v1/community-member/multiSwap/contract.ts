var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/allocation', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;
    let fromCabn = null;
    let allocation = null;

    if (!req.query.fromCabnId || !req.query.fromNetworkId) {
      return res.http400('fromCabnId & fromNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromCabnId) || !mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)) {
      return res.http400('Invalid fromCabnId or fromNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId })
    fromCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.fromCabnId }).populate('currency')

    if (address && fromNetwork && fromCabn) {
      req.query.bridgeContractAddress = fromNetwork.contractAddress;
      allocation = await contractHelper.getCurrentAllowance(address, fromNetwork, fromCabn, req.query.bridgeContractAddress)
      if (allocation) {
        allocation = await swapUtilsHelper.amountToHuman_(fromNetwork, fromCabn, allocation.toFixed());
      }
      let allocationResponse: any = {}
      allocationResponse.allocation = allocation;
      allocationResponse.contractAddress = req.query.bridgeContractAddress;

      return res.http200({
        data: allocationResponse
      });
    }

    return res.http400('Invalid fromCabnId or fromNetworkId');

  }));

  router.get('/allocation/approve', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;
    let fromCabn = null;
    let data = null;

    if (!req.query.fromCabnId || !req.query.fromNetworkId || !req.query.amount) {
      return res.http400('fromCabnId & fromNetworkId & amount are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromCabnId) || !mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)) {
      return res.http400('Invalid fromCabnId or fromNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId })
    fromCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.fromCabnId }).populate('currency')

    if (address && fromNetwork && fromCabn) {
      req.query.bridgeContractAddress = fromNetwork.contractAddress;
      data = await contractHelper.approveAllocation(address, fromNetwork, fromCabn, req.query.bridgeContractAddress, req.query.amount);
      return res.http200({
        data: data
      });
    }

    return res.http400('Invalid fromCabnId or fromNetworkId');

  }));

  router.get('/gas/estimation', asyncMiddleware(async (req: any, res: any) => {

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
      let response = await contractHelper.doSwapAndGetTransactionPayload(address, fromNetwork, fromCabn, req.query.bridgeContractAddress, req.query.amount, toNetwork, toCabn, true);
      if (response.code == 200) {
        return res.http200({
          data: response.data
        });
      } else {
        return res.http400(response.message);
      }
    }

    return res.http400('Invalid fromCabnId, fromNetworkId, toCabnId or toNetworkId');

  }));

  router.get('/swap', asyncMiddleware(async (req: any, res: any) => {

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
      let response = await contractHelper.doSwapAndGetTransactionPayload(address, fromNetwork, fromCabn, req.query.bridgeContractAddress, req.query.amount, toNetwork, toCabn, false);
      if (response.code == 200) {
        return res.http200({
          data: response.data
        });
      } else {
        return res.http400(response.message);
      }
    }

    return res.http400('Invalid fromCabnId, fromNetworkId, toCabnId or toNetworkId');

  }));

  router.get('/withdraw/signed/:txId', asyncMiddleware(async (req: any, res: any) => {

    let address = null;

    if (!req.params.txId) {
      return res.http400('txId is required.');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    let oldSwapTransaction = await db.SwapAndWithdrawTransactions.findOne({ receiveTransactionId: req.params.txId }).populate('toNetwork');
    console.log(oldSwapTransaction);
    if (oldSwapTransaction) {
      let withdrawSigned = await contractHelper.withdrawSigned(address, oldSwapTransaction, oldSwapTransaction.toNetwork);
      console.log(withdrawSigned);
      return res.http200({
        data: withdrawSigned
      });
    }

    return res.http400('Invalid txId');

  }));

};
