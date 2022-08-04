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

    if(address && network && cabn){
      allocation = await web3Helper.currentAllowance(address, network, cabn, req.query.bridgeContractAddress)
      if(allocation){
        allocation = await web3Helper.amountToHuman_(network, cabn, allocation.toFixed());
      }
      console.log(allocation)
    }else {
      // change this error message
      return res.http400('Invalid cabnId or networkId');
    }

    let allocationResponse: any = {}
    allocationResponse.allocation = allocation;
    allocationResponse.contractAddress = req.query.bridgeContractAddress;
    allocationResponse.network = network;
    allocationResponse.address = address;

    return res.http200({
      contractAllocation: allocationResponse
    });

  }));

  router.post('/allocation/approve', asyncMiddleware(async (req: any, res: any) => {

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

    if(address && network && cabn){
      allocation = await web3Helper.currentAllowance(address, network, cabn, req.query.bridgeContractAddress)
      if(allocation){
        allocation = await web3Helper.amountToHuman_(network, cabn, allocation.toFixed());
      }
      console.log(allocation)
    }else {
      // change this error message
      return res.http400('Invalid cabnId or networkId');
    }

    let allocationResponse: any = {}
    allocationResponse.allocation = allocation;
    allocationResponse.contractAddress = req.query.bridgeContractAddress;
    allocationResponse.network = network;
    allocationResponse.address = address;

    return res.http200({
      contractAllocation: allocationResponse
    });

  }));

};
