
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = function (router) {

  router.post('/create', async (req, res) => {

    if (!req.body.tokens || !req.body.skakingContract || !req.body.apeRouter || !req.body.taxDistributor) {
      return res.http400('tokens & skakingContract & apeRouter & taxDistributor are required.');
    }

    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    let crucibleAprsToken = await db.CrucibleAprsTokens.create(req.body)

    return res.http200({
      crucibleAprsToken: crucibleAprsToken
    });

  });

  router.put('/update/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.tokens || !req.body.skakingContract || !req.body.apeRouter || !req.body.taxDistributor) {
      return res.http400('tokens & skakingContract & apeRouter & taxDistributor are required.');
    }

    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    let crucibleAprsToken = await db.CrucibleAprsTokens.findOneAndUpdate(filter, req.body, { new: true })

    return res.http200({
      crucibleAprsToken: crucibleAprsToken
    });

  });

  router.get('/list', async (req, res) => {

    var filter = {}

    let crucibleAprsTokens = await db.CrucibleAprsTokens.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      crucibleAprsTokens: crucibleAprsTokens
    });

  });

  router.get('/:id', async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    let crucibleAprsToken = await db.CrucibleAprsTokens.findOne(filter)

    return res.http200({
      crucibleAprsToken: crucibleAprsToken
    });

  });

  router.delete('/:id', async (req, res) => {
    let filter = {}

    await db.CrucibleAprsTokens.remove({ _id: req.params.id })

    return res.http200({
      message: stringHelper.strSuccess
    });
  })

};
