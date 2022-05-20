
const { db, asyncMiddleware, commonFunctions } = global
const mailer = global.mailer;
var mongoose = require('mongoose');


module.exports = function (router) {

  router.post('/create', async (req, res) => {

    if (!req.body.name || !req.body.siteName) {
      return res.http400('name & siteName are required.');
    }
    req.body.user = req.user._id

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()

    let organization = await db.Organizations.create(req.body)

    return res.http200({
      organization: organization
    });

  });

  router.put('/update/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.siteName) {
      return res.http400('name & siteName are required.');
    }

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedAt = new Date()

    let organization = await db.Organizations.findOneAndUpdate(filter, req.body, { new: true });

    return res.http200({
      organization: organization
    });

  });

  router.get('/list', async (req, res) => {

    var matchFilter = {}
    var filterOrList= []
    var filterAndList= []

    if(req.query.search){
      let reg = new RegExp(unescape(req.query.search), 'i');
      filterOrList.push({nameInLower: reg})
      filterOrList.push({siteName: reg})
    }

    if(filterOrList && filterOrList.length > 0){
      matchFilter.$or = []
      matchFilter.$or.push({$or: filterOrList})
    }

    if(filterAndList && filterAndList.length > 0){
      matchFilter.$and = []
      matchFilter.$and.push({$and: filterAndList})
    }

    let organizations = await db.Organizations.find(matchFilter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      organizations: organizations
    });

  });

  router.get('/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    let organization = await db.Organizations.findOne(filter)

    return res.http200({
      organization: organization
    });

  });

  router.get('/users/list/associated/:id', async (req, res) => {

    var filter = {}
    let sort = { createdAt: -1 }
    let users = []

    filter.organization = req.params.id

    users = await db.Users.find(filter).populate('addresses', 'address')
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      users: users
    });

  });

};
