module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.tokenSymbol || !req.body.APR) {
      return res.http400('tokenSymbol & APR are required.');
    }

    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    let crucibleApr = await db.CrucibleAprs.create(req.body)

    return res.http200({
      crucibleApr: crucibleApr
    });

  });

  router.put('/update/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.tokenSymbol || !req.body.APR) {
      return res.http400('tokenSymbol & APR are required.');
    }

    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    let crucibleApr = await db.CrucibleAprs.findOneAndUpdate(filter, req.body, { new: true })

    return res.http200({
      crucibleApr: crucibleApr
    });

  });

  router.get('/list', async (req: any, res: any) => {

    var filter = {}

    let crucibleAprs = await db.CrucibleAprs.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      crucibleAprs: crucibleAprs
    });

  });

  router.get('/:id', async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id }

    let crucibleApr = await db.CrucibleAprs.findOne(filter)

    return res.http200({
      crucibleApr: crucibleApr
    });

  });

  router.delete('/:id', async (req: any, res: any) => {
    let filter = {}

    await db.CrucibleAprs.remove({ _id: req.params.id })

    return res.http200({
      message: stringHelper.strSuccess
    });
  })

};
