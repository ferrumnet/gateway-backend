
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose = require('mongoose');

module.exports = function (router) {

  router.get('/upcoming/list', async (req, res) => {

    var filter = {}
    let currentDateTime = moment().utc().format()
    filter.startDate = {$gt: currentDateTime}

    let presales = await db.Presales.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      presales: presales
    });

  });

  router.get('/recent/list', async (req, res) => {

    var filter = {}
    let currentDateTime = moment().utc().format()
    filter.startDate = {$lte: currentDateTime}

    let presales = await db.Presales.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      presales: presales
    });

  });

  router.get('/:id', async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    let presale = await db.Presales.findOne(filter)

    return res.http200({
      presale: presale
    });

  });

};
