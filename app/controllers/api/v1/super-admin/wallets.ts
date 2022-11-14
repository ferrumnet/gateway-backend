import { isValidObjectId } from "mongoose";

module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.name || !req.body.logo) {
      return res.http400('name & logo are required.');
    }

    req.body.nameInLower = (req.body.name).toLowerCase();
    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    let wallet = await db.Wallets.create(req.body)

    return res.http200({
      wallet: wallet
    });

  });

  router.put('/update/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.logo) {
      return res.http400('name & logo are required.');
    }

    req.body.nameInLower = (req.body.name).toLowerCase();
    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    let wallet = await db.Wallets.findOneAndUpdate(filter, req.body, { new: true })

    return res.http200({
      wallet: wallet
    });

  });

  router.get('/list', async (req: any, res: any) => {

    var filter = {}

    let wallets = await db.Wallets.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      wallets: wallets
    });

  });

  router.get('/:id', async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id }

    let wallet = await db.Wallets.findOne(filter)

    return res.http200({
      wallet: wallet
    });

  });

  router.delete('/:id', async (req: any, res: any) => {
    let filter = {}

    await db.Wallets.remove({ _id: req.params.id })

    return res.http200({
      message: stringHelper.strSuccess
    });
  });

  router.post('/wbn/create', async (req: any, res: any) => {

    if (!req.body.wallet || !req.body.network) {
      return res.http400('wallet & network are required.');
    }

    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    let wbn = await db.WalletByNetwork.create(req.body)

    return res.http200({
      wbn: wbn
    });

  });

  router.get('/wbn/list', async (req: any, res: any) => {

    var filter:any = {}

    if(req.query.network){
      filter.network = req.query.network;
    }

    if(req.query.wallet){
      filter.wallet = req.query.wallet;
    }

    let wbns = await db.WalletByNetwork.find(filter).populate('wallet').populate('network')
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      wbns: wbns
    });

  });

  router.get('/wbn/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    let wbn = await db.WalletByNetwork.findOne(filter).populate('wallet').populate('network')

    return res.http200({
      wbn: wbn
    });

  });

  router.delete('/wbn/:id', async (req: any, res: any) => {
    let filter = {}

    await db.WalletByNetwork.remove({ _id: req.params.id })

    return res.http200({
      message: stringHelper.strSuccess
    });
  });

};
