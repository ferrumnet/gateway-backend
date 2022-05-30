module.exports = function (router: any) {

  router.post('/pledge/:id', asyncMiddleware(async (req: any, res: any) => {

    if (!req.params.id || !req.body.address) {
      return res.http400('raisePoolId & address are required.');
    }

    try{
      await raisePoolsHelper.isAlreadyPledged(req, res)
    }catch(error){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(error),error);
    }
    req.body.address = (req.body.address).toLowerCase()
    req.body.raisePoolId = req.params.id
    req.body.pledgedUserId = req.user._id
    req.body.createdByUser = req.user._id
    req.body.createdAt = new Date()

    let pledgeRaisePool = await db.PledgeRaisePools.create(req.body)

    return res.http200({
      pledgeRaisePool: pledgeRaisePool
    });

  }));

  router.get('/is/pledged/:id', asyncMiddleware(async (req: any, res: any) => {

    let isPledged = false
    try{
      await raisePoolsHelper.isAlreadyPledged(req, res)
      isPledged = false
    }catch(error){
      isPledged = true
    }
    return res.http200({
      isPledged: isPledged
    });

  }));

  router.get('/pledged/:id', asyncMiddleware(async (req: any, res: any) => {

    let pledgeRaisePool = await db.PledgeRaisePools.findOne({raisePoolId: req.params.id, pledgedUserId: req.user._id})
    return res.http200({
      pledgeRaisePool: pledgeRaisePool
    });

  }));

  router.get('/all/pledged', asyncMiddleware(async (req: any, res: any) => {

    let pledgeRaisePools = []
    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      pledgeRaisePools = await db.PledgeRaisePools.find({pledgedUserId: req.user._id})
    } else {
      pledgeRaisePools = await db.PledgeRaisePools.find({pledgedUserId: req.user._id})
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }

    return res.http200({
      pledgeRaisePools: pledgeRaisePools
    });

  }));

};
