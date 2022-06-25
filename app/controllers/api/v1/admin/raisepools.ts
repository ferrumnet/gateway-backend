module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.name || !req.body.startDateTime || !req.body.endDateTime) {
      return res.http400('name & startDateTime & endDateTime are required.');
    }

    req.body.createdByUser = req.user._id
    req.body.organization = req.user.organization
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()

    let raisePool = await db.RaisePools.create(req.body)

    return res.http200({
      raisePool: raisePool
    });

  });

  router.put('/update/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.startDateTime || !req.body.endDateTime) {
      return res.http400('name & startDateTime & endDateTime are required.');
    }

    let oldData = await db.RaisePools.findOne({_id: req.params.id, organization: req.user.organization})

    if(oldData){
      req.body.nameInLower = (req.body.name).toLowerCase()
      req.body.updatedAt = new Date()

      let raisePool = await db.RaisePools.findOneAndUpdate(filter, req.body, { new: true })

      return res.http200({
        raisePool: raisePool
      });
    }

    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorTheRaisePoolIDIsIncorrectOrNotAvailable),stringHelper.strErrorTheRaisePoolIDIsIncorrectOrNotAvailable);

  });

  router.put('/update/status/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.status) {
      return res.http400('status is required.');
    }

    let oldData = await db.RaisePools.findOne({_id: req.params.id, organization: req.user.organization})

    if(oldData){
      req.body.updatedAt = new Date()

      let raisePool = await db.RaisePools.findOneAndUpdate(filter, {status: req.body.status}, { new: true })

      return res.http200({
        raisePool: raisePool
      });
    }

    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorTheRaisePoolIDIsIncorrectOrNotAvailable),stringHelper.strErrorTheRaisePoolIDIsIncorrectOrNotAvailable);
  });

  router.get('/list', async (req: any, res: any) => {

    var filter: any = {}
    var sort = { startDateTime: 1 }
    filter.createdByUser = req.user._id

    let raisePools = await db.RaisePools.find(filter)
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      raisePools: raisePools
    });

  });

  router.get('/:id', async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id }

    let raisePool = await db.RaisePools.findOne(filter)

    return res.http200({
      raisePool: raisePool
    });

  });

  router.get('/all/pledged/users/:id', asyncMiddleware(async (req: any, res: any) => {
    let sort = {createdAt: -1}
    let filter: any = {}
    filter.raisePoolId = req.params.id
    let pledgeRaisePools = []

    let raisePool = await db.RaisePools.findOne({_id: req.params.id, organization: req.user.organization})
    if(raisePool){
      if (req.query.isPagination != null && req.query.isPagination == 'false') {
        pledgeRaisePools = await db.PledgeRaisePools.find(filter).populate('pledgedUserId')
        .sort(sort)
      } else {
        pledgeRaisePools = await db.PledgeRaisePools.find(filter).populate('pledgedUserId')
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
        .sort(sort)
      }
    }

    return res.http200({
      pledgeRaisePoolsUser: pledgeRaisePools
    });

  }));

};
