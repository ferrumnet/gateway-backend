
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = function (router) {

  router.get('/last', async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    let crucibleApr = await db.CrucibleAprs.findOne()
      .sort({ createdAt: -1 })

    return res.http200({
      crucibleApr: crucibleApr
    });

  });

  router.get('/list', async (req, res) => {
    let filter = {}

    let crucibleAprs = await db.CrucibleAprs.find(filter)
      .sort({ createdAt: -1 })


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

};
