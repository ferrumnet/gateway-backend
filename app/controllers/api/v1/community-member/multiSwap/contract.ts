var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/allocation', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let network = null;
    let cabn = null;
    let allocation = null;

    if (!req.query.bridgeContractAddress || !req.query.cabnId || !req.query.networkId) {
      return res.http400('bridgeContractAddress & cabnId & networkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.cabnId) || !mongoose.Types.ObjectId.isValid(req.query.networkId)) {
      return res.http400('Invalid cabnId or networkId');
    }

    req.query.bridgeContractAddress = (req.query.bridgeContractAddress).toLowerCase()

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    network = await db.Networks.findOne({ _id: req.query.networkId })
    cabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.cabnId }).populate('currency')

    if (address && network && cabn) {
      allocation = await contractHelper.getCurrentAllowance(address, network, cabn, req.query.bridgeContractAddress)
      if (allocation) {
        allocation = await web3Helper.amountToHuman_(network, cabn, allocation.toFixed());
      }
      let allocationResponse: any = {}
      allocationResponse.allocation = allocation;
      allocationResponse.contractAddress = req.query.bridgeContractAddress;
      allocationResponse.network = network;
      allocationResponse.address = address;

      return res.http200({
        data: allocationResponse
      });
    }

    // change this error message
    return res.http400('Invalid cabnId or networkId');


  }));

  router.get('/allocation/approve', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let network = null;
    let cabn = null;
    let data = null;

    if (!req.query.bridgeContractAddress || !req.query.cabnId || !req.query.networkId || !req.query.amount) {
      return res.http400('bridgeContractAddress & cabnId & networkId & amount are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.cabnId) || !mongoose.Types.ObjectId.isValid(req.query.networkId)) {
      return res.http400('Invalid cabnId or networkId');
    }

    req.query.bridgeContractAddress = (req.query.bridgeContractAddress).toLowerCase()

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    network = await db.Networks.findOne({ _id: req.query.networkId })
    cabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.cabnId }).populate('currency')

    if (address && network && cabn) {

      data = await contractHelper.approveAllocation(address, network, cabn, req.query.bridgeContractAddress, req.query.amount);
      return res.http200({
        data: data
      });
    }

    // change this error message
    return res.http400('Invalid cabnId or networkId');

  }));

  router.get('/avaialable/liquidity', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let network = null;
    let cabn = null;
    let liquidity = null;

    if (!req.query.bridgeContractAddress || !req.query.cabnId || !req.query.networkId) {
      return res.http400('bridgeContractAddress & cabnId & networkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.cabnId) || !mongoose.Types.ObjectId.isValid(req.query.networkId)) {
      return res.http400('Invalid cabnId or networkId');
    }

    req.query.bridgeContractAddress = (req.query.bridgeContractAddress).toLowerCase()

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    network = await db.Networks.findOne({ _id: req.query.networkId })
    cabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.cabnId }).populate('currency')

    if (address && network && cabn) {
      liquidity = await web3Helper.getAvaialableLiquidity(network, cabn, req.query.bridgeContractAddress);
      return res.http200({
        data: liquidity
      });
    }

    // change this error message
    return res.http400('Invalid cabnId or networkId');


  }));

};
