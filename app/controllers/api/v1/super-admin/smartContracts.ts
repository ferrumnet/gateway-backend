import { isValidObjectId } from "mongoose";
module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.name || !req.body.scabn || !req.body.organization) {
      return res.http400('name & scabn & organization are required.');
    }

    if (req.body.scabn && req.body.scabn.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSmartContractShouldAssociateWithAtleastOneNetwork), stringHelper.strErrorSmartContractShouldAssociateWithAtleastOneNetwork,);
    }

    let error = await commonFunctions.validationForSCBN(req, res, null);
    if (error) {
      return res.http400(error);
    }

    if (!req.body.product) {
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

    if (!req.body.product) {
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

    let filter: any = {}
    let scabnFilter: any = {}

    filter = { _id: req.params.id };
    scabnFilter.smartContract = req.params.id;

    let scabnResponse = await db.SmartCurrencyAddressesByNetwork.remove(scabnFilter)
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

  router.post('/create/scabn', async (req: any, res: any) => {

    if (!req.body.smartContract || !req.body.scabn || !req.body.organization) {
      return res.http400('smartContract & scabn & organization are required.');
    }

    if (req.body.scabn && req.body.scabn.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSmartContractShouldAssociateWithAtleastOneNetwork), stringHelper.strErrorSmartContractShouldAssociateWithAtleastOneNetwork,);
    }

    let smartContract = await db.SmartContracts.findOne({ _id: req.body.smartContract })

    let error = await commonFunctions.validationForSCBN(req, res, smartContract);
    if (error) {
      return res.http400(error);
    }

    req.body.createdByOrganization = req.body.organization;
    req.body.updatedByUser = req.user._id;
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    if (smartContract) {
      smartContract.smartCurrencyAddressesByNetwork.push(await smartContractHelper.createSmartCurrencyAddressesByNetwork(req, smartContract, req.body))
    }
    smartContract.updatedByUser = req.body.updatedByUser;
    smartContract.updatedAt = req.body.updatedAt;
    smartContract = await db.SmartContracts.findOneAndUpdate({ _id: smartContract._id }, smartContract, { new: true });

    return res.http200({
      smartContract: smartContract
    });

  });

  router.put('/update/scabn/:id', async (req: any, res: any) => {

    let filter: any = {};
    if (!req.body.smartContractAddress || !req.body.organization) {
      return res.http400('smartContractAddress & organization are required.');
    }

    filter._id = req.params.id;

    req.body.createdByOrganization = req.body.organization;
    req.body.updatedAt = new Date()

    delete req.body.network;

    let scabn = await db.SmartCurrencyAddressesByNetwork.findOneAndUpdate(filter, req.body, { new: true });

    return res.http200({
      smartCurrencyAddressesByNetwork: scabn
    });

  });

  router.get('/scabn/list', async (req: any, res: any) => {

    var filter = {}

    let scabns = await db.SmartCurrencyAddressesByNetwork.find(filter).populate('network').populate('smartContract').populate('createdByOrganization')
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      smartCurrencyAddressesByNetworks: scabns
    });

  });

  router.get('/scabn/:id', async (req: any, res: any) => {

    var filter: any = {}
    filter._id = req.params.id;

    let scabn = await db.SmartCurrencyAddressesByNetwork.findOne(filter).populate('network').populate('smartContract').populate('createdByOrganization');

    return res.http200({
      smartCurrencyAddressesByNetwork: scabn
    });

  });


};
