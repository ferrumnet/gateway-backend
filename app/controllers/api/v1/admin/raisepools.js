
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose = require('mongoose');

module.exports = function (router) {

  router.post('/create', async (req, res) => {

    if (!req.body.name || !req.body.startDateTime || !req.body.endDateTime) {
      return res.http400('name & startDateTime & endDateTime are required.');
    }

    req.body.createdByUser = req.user._id
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()

    let raisePool = await db.RaisePools.create(req.body)

    return res.http200({
      raisePool: raisePool
    });

  });

  router.put('/update/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.startDateTime || !req.body.endDateTime) {
      return res.http400('name & startDateTime & endDateTime are required.');
    }

    let oldData = await db.RaisePools.findOne({_id: req.params.id, createdByUser: req.user._id})

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

  router.put('/update/status/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.status) {
      return res.http400('status is required.');
    }

    let oldData = await db.RaisePools.findOne({_id: req.params.id, createdByUser: req.user._id})

    if(oldData){
      req.body.updatedAt = new Date()

      let raisePool = await db.RaisePools.findOneAndUpdate(filter, {status: req.body.status}, { new: true })

      return res.http200({
        raisePool: raisePool
      });
    }

    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorTheRaisePoolIDIsIncorrectOrNotAvailable),stringHelper.strErrorTheRaisePoolIDIsIncorrectOrNotAvailable);
  });

  router.get('/list', async (req, res) => {

    var filter = {}
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

  router.get('/:id', async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    let raisePool = await db.RaisePools.findOne(filter)

    return res.http200({
      raisePool: raisePool
    });

  });

};
