var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/allocation', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let sourceNetwork = null;
    let sourceCabn = null;
    let allocation = null;

    if (!req.query.sourceCabnId || !req.query.sourceNetworkId) {
      return res.http400('sourceCabnId & sourceNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceCabnId) || !mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)) {
      return res.http400('Invalid sourceCabnId or sourceNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    sourceNetwork = await db.Networks.findOne({ _id: req.query.sourceNetworkId })
    sourceCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.sourceCabnId }).populate('currency')

    if(sourceNetwork){
      req.query.smartContractAddress = await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(sourceNetwork._id);
    }

    if (address && sourceNetwork && sourceCabn &&  req.query.smartContractAddress) {
      allocation = await contractHelper.getCurrentAllowance(address, sourceNetwork, sourceCabn, req.query.smartContractAddress)
      if (allocation) {
        allocation = await swapUtilsHelper.amountToHuman_(sourceNetwork, sourceCabn, allocation.toFixed());
      }
      let allocationResponse: any = {}
      allocationResponse.allocation = allocation;
      allocationResponse.contractAddress = req.query.smartContractAddress;

      return res.http200({
        data: allocationResponse
      });
    }

    return res.http400('Invalid sourceCabnId, sourceNetworkId or smartContractAddress');

  }));

  router.get('/allocation/approve', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let sourceNetwork = null;
    let sourceCabn = null;
    let data = null;

    if (!req.query.sourceCabnId || !req.query.sourceNetworkId || !req.query.amount) {
      return res.http400('sourceCabnId & sourceNetworkId & amount are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceCabnId) || !mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)) {
      return res.http400('Invalid sourceCabnId or sourceNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    sourceNetwork = await db.Networks.findOne({ _id: req.query.sourceNetworkId })
    sourceCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.sourceCabnId }).populate('currency')

    if(sourceNetwork){
      req.query.smartContractAddress = await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(sourceNetwork._id);
    }

    if (address && sourceNetwork && sourceCabn && req.query.smartContractAddress) {
      data = await contractHelper.approveAllocation(address, sourceNetwork, sourceCabn, req.query.smartContractAddress, req.query.amount);
      return res.http200({
        data: data
      });
    }

    return res.http400('Invalid sourceCabnId, sourceNetworkId or smartContractAddress');

  }));

  router.get('/gas/estimation', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let sourceNetwork = null;
    let sourceCabn = null;
    let destinationNetwork = null;
    let destinationCabn = null;
    let data = null;

    if (!req.query.sourceCabnId || !req.query.sourceNetworkId || !req.query.amount || !req.query.destinationCabnId || !req.query.destinationNetworkId) {
      return res.http400('sourceCabnId & sourceNetworkId & amount & destinationCabnId & destinationNetworkId  are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceCabnId) || !mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)
      || !mongoose.Types.ObjectId.isValid(req.query.destinationCabnId) || !mongoose.Types.ObjectId.isValid(req.query.destinationNetworkId)) {
      return res.http400('Invalid sourceCabnId, sourceNetworkId, destinationCabnId or destinationNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    sourceNetwork = await db.Networks.findOne({ _id: req.query.sourceNetworkId })
    sourceCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.sourceCabnId }).populate('currency')

    destinationNetwork = await db.Networks.findOne({ _id: req.query.destinationNetworkId })
    destinationCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.destinationCabnId }).populate('currency')

    if(sourceNetwork){
      req.query.smartContractAddress = await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(sourceNetwork._id);
    }

    if (address && sourceNetwork && sourceCabn && destinationNetwork && destinationCabn && req.query.smartContractAddress) {
      let response = await contractHelper.doSwapAndGetTransactionPayload(address, sourceNetwork, sourceCabn, req.query.smartContractAddress, req.query.amount, destinationNetwork, destinationCabn, true);
      if (response.code == 200) {
        return res.http200({
          data: response.data
        });
      } else {
        return res.http400(response.message);
      }
    }

    return res.http400('Invalid sourceCabnId, sourceNetworkId, destinationCabnId, destinationNetworkId or smartContractAddress');

  }));

  router.get('/swap', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let sourceNetwork = null;
    let sourceCabn = null;
    let destinationNetwork = null;
    let destinationCabn = null;

    if (!req.query.sourceCabnId || !req.query.sourceNetworkId || !req.query.amount || !req.query.destinationCabnId || !req.query.destinationNetworkId) {
      return res.http400('sourceCabnId & sourceNetworkId & amount & destinationCabnId & destinationNetworkId  are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceCabnId) || !mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)
      || !mongoose.Types.ObjectId.isValid(req.query.destinationCabnId) || !mongoose.Types.ObjectId.isValid(req.query.destinationNetworkId)) {
      return res.http400('Invalid sourceCabnId, sourceNetworkId, destinationCabnId or destinationNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    sourceNetwork = await db.Networks.findOne({ _id: req.query.sourceNetworkId })
    sourceCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.sourceCabnId }).populate('currency')

    destinationNetwork = await db.Networks.findOne({ _id: req.query.destinationNetworkId })
    destinationCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.destinationCabnId }).populate('currency')

    if(sourceNetwork){
      req.query.smartContractAddress = await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(sourceNetwork._id);
    }

    if (address && sourceNetwork && sourceCabn && destinationNetwork && destinationCabn && req.query.smartContractAddress) {
      let response = await contractHelper.doSwapAndGetTransactionPayload(address, sourceNetwork, sourceCabn, req.query.smartContractAddress, req.query.amount, destinationNetwork, destinationCabn, false);
      if (response.code == 200) {
        return res.http200({
          data: response.data
        });
      } else {
        return res.http400(response.message);
      }
    }

    return res.http400('Invalid sourceCabnId, sourceNetworkId, destinationCabnId, destinationNetworkId or smartContractAddress');

  }));

  router.get('/withdraw/signed/:txId', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let smartContractAddress = null;
    if (!req.params.txId) {
      return res.http400('txId is required.');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    let oldSwapTransaction = await db.SwapAndWithdrawTransactions.findOne({ receiveTransactionId: req.params.txId }).populate('destinationNetwork');
    console.log(oldSwapTransaction);

    if(oldSwapTransaction.destinationNetwork){
      smartContractAddress = await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(oldSwapTransaction.destinationNetwork._id);
    }

    if (oldSwapTransaction && smartContractAddress) {
      let withdrawSigned = await contractHelper.withdrawSigned(address, oldSwapTransaction, smartContractAddress);
      console.log(withdrawSigned);
      return res.http200({
        data: withdrawSigned
      });
    }

    return res.http400('Invalid txId or smartContractAddress');

  }));

};
