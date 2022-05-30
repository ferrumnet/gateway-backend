module.exports = function (router: any) {

  router.put('/update/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.startDateTime || !req.body.endDateTime) {
      return res.http400('name & startDateTime & endDateTime are required.');
    }

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedAt = new Date()

    let raisePool = await db.RaisePools.findOneAndUpdate(filter, req.body, { new: true })

    return res.http200({
      raisePool: raisePool
    });

  });

  router.put('/update/status/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.status) {
      return res.http400('status is required.');
    }

    req.body.updatedAt = new Date()

    let raisePool = await db.RaisePools.findOneAndUpdate(filter, { status: req.body.status }, { new: true })

    return res.http200({
      raisePool: raisePool
    });
  });

  router.get('/list', async (req: any, res: any) => {

    var filter: any = {}
    var sort: any = { startDateTime: 1 }

    if (req.query.search) {
      let reg = new RegExp(unescape(req.query.search), 'i');
      filter.nameInLower = reg
    }

    if (req.query.status) {

      Object.keys(sort).forEach(key => {
        delete sort[key];
      })
      filter.status = req.query.status
      if (req.query.status == 'upcoming') {
        sort.startDateTime = 1
      } else if (req.query.status == 'open') {
        sort.endDateTime = 1
      } else if (req.query.status == 'closed') {
        sort.endDateTime = 1
      }
    }

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

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      pledgeRaisePools = await db.PledgeRaisePools.find(filter).populate('pledgedUserId')
      .sort(sort)
    } else {
      pledgeRaisePools = await db.PledgeRaisePools.find(filter).populate('pledgedUserId')
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
      .sort(sort)
    }

    return res.http200({
      pledgeRaisePoolsUser: pledgeRaisePools
    });

  }));

  router.get('/all/pledged/againts/single/user/:userId', asyncMiddleware(async (req: any, res: any) => {
    let sort = {createdAt: -1}
    let filter: any = {}
    filter.pledgedUserId = req.params.userId
    let pledgeRaisePools = []

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      pledgeRaisePools = await db.PledgeRaisePools.find(filter).populate('raisePoolId')
      .sort(sort)
    } else {
      pledgeRaisePools = await db.PledgeRaisePools.find(filter).populate('raisePoolId')
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
      .sort(sort)
    }

    return res.http200({
      pledgeRaisePools: pledgeRaisePools
    });

  }));

};
