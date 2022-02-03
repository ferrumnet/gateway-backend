
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose = require('mongoose');

module.exports = function (router) {

  router.post('/create', async (req, res) => {

    if (!req.body.name || !req.body.startDate) {
      return res.http400('name & startDate are required.');
    }

    req.body.createdByUser = req.user._id
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()

    let presale = await db.Presales.create(req.body)

    return res.http200({
      presale: presale
    });

  });

  router.put('/update/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.startDate) {
      return res.http400('name & startDate are required.');
    }

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedAt = new Date()

    let presale = await db.Presales.findOneAndUpdate(filter, req.body, { new: true })

    return res.http200({
      presale: presale
    });

  });

  router.get('/list', async (req, res) => {

    var filter = {}
    filter.createdByUser = req.user._id

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
