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
    req.query.bridgeContractAddress = fromNetwork.contractAddress;

    if (address && fromNetwork && fromCabn) {
      allocation = await contractHelper.getCurrentAllowance(address, fromNetwork, fromCabn, req.query.bridgeContractAddress)
      if (allocation) {
        allocation = await web3Helper.amountToHuman_(fromNetwork, fromCabn, allocation.toFixed());
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
    req.query.bridgeContractAddress = fromNetwork.contractAddress;
    
    if (address && fromNetwork && fromCabn) {

      data = await contractHelper.approveAllocation(address, fromNetwork, fromCabn, req.query.bridgeContractAddress, req.query.amount);
      return res.http200({
        data: data
      });
    }

    return res.http400('Invalid fromCabnId or fromNetworkId');

  }));

  router.get('/avaialable/liquidity', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;
    let fromCabn = null;
    let liquidity = null;

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
    req.query.bridgeContractAddress = fromNetwork.contractAddress;

    if (address && fromNetwork && fromCabn) {
      liquidity = await web3Helper.getAvaialableLiquidity(fromNetwork, fromCabn, req.query.bridgeContractAddress);
      return res.http200({
        data: {liquidity: liquidity}
      });
    }

    return res.http400('Invalid fromCabnId or fromNetworkId');

  }));

};
