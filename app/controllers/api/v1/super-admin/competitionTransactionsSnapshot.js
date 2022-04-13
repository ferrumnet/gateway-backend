const { db, asyncMiddleware, commonFunctions, stringHelper } = global
var mongoose = require('mongoose');

module.exports = function (router) {

  router.get('/blockNumberRange/verified/:verified', asyncMiddleware(async (req, res) => {
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
   let transactionsByContractAddress = await db.CompetitionTransactionsSnapshots.aggregate([ filter, {
          '$group': {
            '_id': '$contractAddress', 
            'toBlock': {'$max': '$blockNumber'}, 
            'fromBlock': {'$min': '$blockNumber'}, 
            'transactions': {'$sum': 1}
          }
        }
      ])
      let totalTransactionsCount = 0
      transactionsByContractAddress.forEach(record=>{
        totalTransactionsCount += record.transactions
      })
    
    return res.http200({totalTransactionsCount, transactionsByContractAddress})
  }));

  router.post('/blockNumbers/verify', asyncMiddleware(async (req, res) => { 
    const transactionsCount = parseInt(req.body.transactionsCount)
    const fromBlockNumber = req.body.fromBlockNumber
    const toBlockNumber = req.body.toBlockNumber

   if(transactionsCount && fromBlockNumber && toBlockNumber){
    let filter = {$or:[{'verifiedBlockNumber': null}, {'verifiedBlockNumber': false}], blockNumber:{$gte: fromBlockNumber}, blockNumber:{$lte: toBlockNumber}}
    const count = await db.CompetitionTransactionsSnapshots.countDocuments( filter)
    if(transactionsCount == count){        
       await db.CompetitionTransactionsSnapshots.updateMany(
            { blockNumber: { $gte: fromBlockNumber}, blockNumber:{$lte:toBlockNumber } },
            { $set: { "verifiedBlockNumber" : true } }
         );
         return res.http200('blockNumberRange verified successfully')
    }
    return res.http400('Wrong TransactionsCount')
   }
   return res.http400('TransactionsCount, fromBlockNumber and toBlockNumber required')
  }));

}
