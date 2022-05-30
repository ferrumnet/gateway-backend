module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.name || !req.body.url || !req.body.networks) {
      return res.http400('name & url & networks are required.');
    }

    if (req.body.networks && req.body.networks.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorDEXShouldAssociateWithAtleastOneNetwork),stringHelper.strErrorDEXShouldAssociateWithAtleastOneNetwork,);
    }

    req.body.user = req.user._id
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()

    let dex = await db.DecentralizedExchanges.create(req.body)
    await createNetworkDexes(dex)

    return res.http200({
      dex: dex
    });

  });

  router.put('/update/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.url || !req.body.networks) {
      return res.http400('name & url & networks are required.');
    }

    if (req.body.networks && req.body.networks.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorDEXShouldAssociateWithAtleastOneNetwork),stringHelper.strErrorDEXShouldAssociateWithAtleastOneNetwork,);
    }

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedAt = new Date()

    let dex = await db.DecentralizedExchanges.findOneAndUpdate(filter, req.body, { new: true }).populate('networks')
    await createNetworkDexes(dex)


    return res.http200({
      dex: dex
    });

  });

  router.put('/active/inactive/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    let dex = await db.DecentralizedExchanges.findOne(filter)
    if(dex){
      dex.isActive = !dex.isActive
    }
    req.body.updatedAt = new Date()

    dex = await db.DecentralizedExchanges.findOneAndUpdate(filter, dex, { new: true })

    return res.http200({
      dex: dex
    });

  });

  router.get('/list', async (req: any, res: any) => {

    var filter = {}

    let dexes = await db.DecentralizedExchanges.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      dexes: dexes
    });

  });

  router.get('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    let dex = await db.DecentralizedExchanges.findOne(filter).populate('networks')

    return res.http200({
      dex: dex
    });

  });

  async function getNetworkDexes(dex: any){
    let networkDexes = []
    if(dex){
      networkDexes = await db.NetworkDexes.find({dex: dex._id},'network').populate('network')
    }
    return networkDexes
  }

  async function createNetworkDexes(dex: any){
    if (dex && dex.networks && dex.networks.length > 0) {
      for(let i=0; i< dex.networks.length; i++){
        let count = await db.NetworkDexes.count({network: dex.networks[i], dex: dex._id})
        if(count == 0){
          let networkDex = await db.NetworkDexes.create({network: dex.networks[i], dex: dex._id})
        }
      }
    }
  }

};
