const { db, asyncMiddleware, commonFunctions, stringHelper, cTSnapshotHelper, bscScanHelper } = global
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

  router.post('/recaptureTransactions/byTokenContractAddress/:tokenContractAddress', asyncMiddleware(async (req, res) => { 
   
    const fromBlockNumber = parseInt(req.body.fromBlockNumber)
    const toBlockNumber = parseInt(req.body.toBlockNumber)
    const tokenContractAddress = req.params.tokenContractAddress
    if(tokenContractAddress && fromBlockNumber && toBlockNumber){
      if(fromBlockNumber < toBlockNumber){
        const filter = {isActive:true, tokenContractAddress}
        const snapshotMeta = await db.CompetitionTransactionsSnapshotMeta.findOne(filter)
        if(snapshotMeta){
          if(toBlockNumber <= parseInt(snapshotMeta.currentBlockNumber)){
            //fromblock and toblock should be less then  
          let transations = await bscScanHelper.queryByCABN(snapshotMeta.tokenContractAddress, fromBlockNumber, toBlockNumber);        
          if(transations.length > 0){
             const snapShotFilter = {blockNumber:{$gte: fromBlockNumber}, blockNumber:{$lte: toBlockNumber}}
             await db.CompetitionTransactionsSnapshots.deleteMany(snapShotFilter)
             await db.CompetitionTransactionsSnapshots.insertMany(transations)
             return res.http200(`${transations.length} transactions are stored`)
          }
          return res.http200('Zero transactions received from BscScan')  
          }
               
        }
        return res.http200('TokenContractAddress not registered with Cron')
      }
      return res.http400('Invalid block Range')
    }
    return res.http400('TokenContractAddress, fromBlockNumber and toBlockNumber required')
    

  }));
}
