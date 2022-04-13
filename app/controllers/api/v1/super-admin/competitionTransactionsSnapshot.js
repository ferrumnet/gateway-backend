const { db, asyncMiddleware, commonFunctions, stringHelper } = global
var mongoose = require('mongoose');

module.exports = function (router) {

  router.get('/bloackRange/verified/:verified', asyncMiddleware(async (req, res) => {
    let filter = {}
    if(req.params.verified === 'true'){
        filter = {'$match':{ 'verifiedBlockNumber': true}}
    }else{
        filter = {
            '$match': {
              '$or': [{'verifiedBlockNumber': null }, {'verifiedBlockNumber': false}]
            }
          }
    }

   let range = await db.CompetitionTransactionsSnapshots.aggregate([ filter, {
          '$group': {
            '_id': '$verifiedBlockNumber', 
            'toBlock': {'$max': '$blockNumber'}, 
            'fromBlock': {'$min': '$blockNumber'}, 
            'transactions': {'$sum': 1}
          }
        }
      ])
    return res.http200({range})
  }));
}
