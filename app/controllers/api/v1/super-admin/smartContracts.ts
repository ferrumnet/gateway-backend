import { isValidObjectId } from "mongoose";
module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.name || !req.body.scabn|| !req.body.organization) {
      return res.http400('name & scabn & organization are required.');
    }

    if (req.body.scabn && req.body.scabn.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSmartContractShouldAssociateWithAtleastOneNetwork), stringHelper.strErrorSmartContractShouldAssociateWithAtleastOneNetwork,);
    }

    let error = await commonFunctions.validationForSCBN(req, res)
    if (error) {
      return res.http400(error);
    }

    if(!req.body.product){
      req.body.product = null;
    }

    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.createdByOrganization = req.body.organization

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()
    
    let smartContract = await db.SmartContracts.create(req.body)
    smartContract.smartCurrencyAddressesByNetwork = await smartContractHelper.createSmartCurrencyAddressesByNetwork(req, smartContract, req.body)
    smartContract = await db.SmartContracts.findOneAndUpdate({ _id: smartContract._id }, smartContract, { new: true });

    return res.http200({
      smartContract: smartContract
    });

  });

  router.put('/update/:id', async (req: any, res: any) => {

    if (!req.body.name || !req.body.organization) {
      return res.http400('name & organization are required.');
    }

    if(!req.body.product){
      req.body.product = null;
    }

    req.body.updatedByUser = req.user._id
    req.body.createdByOrganization = req.body.organization

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedAt = new Date()
    delete req.body.smartCurrencyAddressesByNetwork;

    let smartContract = await db.SmartContracts.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });

    return res.http200({
      smartContract: smartContract
    });

  });

  router.get('/list', async (req: any, res: any) => {

    var filter = {}

    let smartContracts = await db.SmartContracts.find(filter).populate('product')
      .populate({
        path: 'smartCurrencyAddressesByNetwork',
        populate: {
          path: 'network',
          model: 'networks'
        }
      })
      
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      smartContracts: smartContracts
    });

  });

  router.delete('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    // if(await networksHelper.cabnAssociationWithNetwork(req, res) > 0 || await networksHelper.dexAssociationWithNetwork(req, res) > 0){
    //   return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNetworkDelete),stringHelper.strErrorNetworkDelete,);
    // }

    let response = await db.SmartContracts.remove(filter)

    return res.http200({
      smartContract: response
    });

  });

  router.get('/:id', async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id }

    let smartContract = await db.SmartContracts.findOne(filter).populate('product')
    .populate({
      path: 'smartCurrencyAddressesByNetwork',
      populate: {
        path: 'network',
        model: 'networks'
      }
    })

    return res.http200({
      smartContract: smartContract
    });

  });
  


};
