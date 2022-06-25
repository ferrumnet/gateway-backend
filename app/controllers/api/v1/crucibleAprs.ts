module.exports = function (router: any) {

  router.get('/last', async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id }

    let crucibleApr = await db.CrucibleAprs.findOne()
      .sort({ createdAt: -1 })

    return res.http200({
      crucibleApr: crucibleApr
    });

  });

  router.get('/list', async (req: any, res: any) => {
    let filter = {}

    if (req.query.isFreshData && req.query.isFreshData == 'true') {
      crucibleAprsHelper.crucibleAutoCalculateApr(req, res, true)
    }

    let crucibleAprs = await db.CrucibleAprs.find(filter)
      .sort({ createdAt: -1 })


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

};
