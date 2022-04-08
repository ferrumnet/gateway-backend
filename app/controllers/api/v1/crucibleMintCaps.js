
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = function (router) {

  router.get('/last', async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    let crucibleMintCap = await db.CrucibleMintCaps.findOne()
      .sort({ createdAt: -1 })

    return res.http200({
      crucibleMintCap: crucibleMintCap
    });

  });

};
