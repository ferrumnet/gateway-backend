var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/avaialable', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let sourceNetwork = null;
    let fromCabn = null;
    let liquidity = null;

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
    fromCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.sourceCabnId }).populate('currency')

    if(sourceNetwork){
      req.query.smartContractAddress = await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(sourceNetwork._id);
    }

    if (address && sourceNetwork && fromCabn && req.query.smartContractAddress) {
      liquidity = await web3Helper.getAvaialableLiquidity(sourceNetwork, fromCabn, req.query.smartContractAddress);
      return res.http200({
        data: {liquidity: liquidity}
      });
    }

    return res.http400('Invalid sourceCabnId, sourceNetworkId or smartContractAddress');

  }));

};
