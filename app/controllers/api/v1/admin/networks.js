
const { db, asyncMiddleware, commonFunctions } = global
const mailer = global.mailer;
var mongoose = require('mongoose');

module.exports = function (router) {

  router.get('/list', async (req, res) => {

    var filter = {}
    let netwroks = []

    if (req.query.search) {

      let reg = new RegExp(unescape(req.query.search), 'i');
      filter.name = reg

    }

    if(req.query.isActive){
      filter.isActive = req.query.isActive
    }

    if(req.query.isPagination != null && req.query.isPagination == 'false'){

      netwroks = await db.Networks.find(filter).populate('parentId')
      .sort({ createdAt: -1 })

    }else {

      netwroks = await db.Networks.find(filter).populate('parentId')
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    }

    return res.http200({
      netwroks: netwroks
    });

  });

  router.get('/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    let network = await db.Networks.findOne(filter).populate('parentId')

    return res.http200({
      network: network
    });

  });

};
