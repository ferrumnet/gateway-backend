var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/get/transaction', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;
    let fromCabn = null;
    let toNetwork = null;
    let toCabn = null;
    let data = null;

    if (!req.query.bridgeContractAddress || !req.query.fromCabnId || !req.query.fromNetworkId || !req.query.amount || !req.query.toCabnId || !req.query.toNetworkId) {
      return res.http400('bridgeContractAddress & fromCabnId & fromNetworkId & amount & toCabnId & toNetworkId  are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromCabnId) || !mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)
      || !mongoose.Types.ObjectId.isValid(req.query.toCabnId) || !mongoose.Types.ObjectId.isValid(req.query.toNetworkId)) {
      return res.http400('Invalid fromCabnId, fromNetworkId, toCabnId or toNetworkId');
    }

    req.query.bridgeContractAddress = (req.query.bridgeContractAddress).toLowerCase()

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId })
    fromCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.fromCabnId }).populate('currency')

    toNetwork = await db.Networks.findOne({ _id: req.query.toNetworkId })
    toCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.toCabnId }).populate('currency')

    if (address && fromNetwork && fromCabn && toNetwork && toCabn) {

      await contractHelper.doSwapAndGetTransactionPayload(address, fromNetwork, fromCabn, req.query.bridgeContractAddress, req.query.amount, toNetwork, toCabn, res);

    } else {
      // change this error message
      return res.http400('Invalid fromCabnId, fromNetworkId, toCabnId or toNetworkId');
    }

  }));

};