
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = function (router) {

  router.post('/create', async (req, res) => {

    if (!req.body.cfrm || !req.body.cfrmLp || !req.body.cfrmX || !req.body.cfrmXLp) {
      return res.http400('cfrm & cfrmLp & cfrmX & cfrmXLp are required.');
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

  router.put('/update/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.cfrm || !req.body.cfrmLp || !req.body.cfrmX || !req.body.cfrmXLp) {
      return res.http400('cfrm & cfrmLp & cfrmX & cfrmXLp are required.');
    }

    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    let crucibleApr = await db.CrucibleAprs.findOneAndUpdate(filter, req.body, { new: true })

    return res.http200({
      crucibleApr: crucibleApr
    });

  });

  router.get('/list', async (req, res) => {

    var filter = {}

    let crucibleAprs = await db.CrucibleAprs.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      crucibleAprs: crucibleAprs
    });

  });

  router.get('/:id', async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    let crucibleApr = await db.CrucibleAprs.findOne(filter)

    return res.http200({
      crucibleApr: crucibleApr
    });

  });

  router.delete('/:id', async (req, res) => {
    let filter = {}

    await db.CrucibleAprs.remove({ _id: req.params.id })

    return res.http200({
      message: stringHelper.strSuccess
    });
  })

};
