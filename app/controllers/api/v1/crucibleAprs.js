
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

  router.get('/:id', async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    let crucibleApr = await db.CrucibleAprs.findOne(filter)

    return res.http200({
      crucibleApr: crucibleApr
    });

  });

};
