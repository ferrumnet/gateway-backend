const { db, asyncMiddleware, commonFunctions, stringHelper, cTSnapshotHelper, bscScanHelper } = global
var mongoose = require('mongoose');

module.exports = function (router) {

  router.post("/create", asyncMiddleware(async (req, res) => {
    const filter = {tokenContractAddress:req.body.tokenContractAddress}
    if (!req.body.currentBlockNumber && !req.body.tokenContractAddress) {
      return res.http400('CurrentBlockNumber and TokenContractAddress are required.');
    }
    console.log(db) 
    let meta = await db.CompetitionTransactionsSnapshotMeta.findOne(filter)
    if(!meta){
      const meta = await db.CompetitionTransactionsSnapshotMeta.create(req.body);
      return res.http200({ meta });
    }
    return res.http400(`Meta for ${req.body.tokenContractAddress} already exists `);
  }));
  
  router.get('/list', asyncMiddleware(async (req, res) => {

    var filter = {}
    let metaList = []
    let sort = { createdAt: -1 }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      metaList = await db.CompetitionTransactionsSnapshotMeta.find(filter)
      .sort(sort)

    }else {

      metaList = await db.CompetitionTransactionsSnapshotMeta.find(filter)
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }
    return res.http200({ metaList});

  }));

  router.put('/active/inactive/:id', asyncMiddleware(async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    let meta = await db.CompetitionTransactionsSnapshotMeta.findOne(filter)
    if(meta){
      meta.isActive = !meta.isActive
    }
    meta = await db.CompetitionTransactionsSnapshotMeta.findOneAndUpdate(filter, meta, { new: true })
    return res.http200({meta});

  }));


  router.get('/:id', asyncMiddleware(async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    let meta = await db.CompetitionTransactionsSnapshotMeta.findOne(filter)

    return res.http200({meta});

  }));

}
