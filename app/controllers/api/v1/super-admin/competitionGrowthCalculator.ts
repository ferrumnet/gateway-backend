var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/recalculate/competitionsGrowth/by/tokenContractAddress/:tokenContractAddress/competitionId/:competitionId', asyncMiddleware(async (req: any, res: any) => {
    const pauseCron = await db.TemporaryPauseCrons.findOne({cronName:'competitiontransactionssnapshotjob'}) 
    const paused = pauseCron ? pauseCron.paused : false
    if(paused){
      const tokenContractAddress = req.params.tokenContractAddress   
      const competitionId = req.params.competitionId
      const filter = {_id: competitionId, isActive:true} 
      const competition = await db.Competitions.findOne(filter)
     
      if(competition){
        const leaderboard = await db.Leaderboards.findOne({_id: competition.leaderboard})
        if(leaderboard){
          let transactions = await db.CompetitionTransactionsSnapshots.find({contractAddress:tokenContractAddress})      
          const meta = await db.CompetitionTransactionsSnapshotMeta.findOne({tokenContractAddress, isActive:true})
          if(meta){
            const endBlock = meta.currentBlockNumber 
            if(transactions.length > 0){     
              await db.CompetitionGrowthTracker.updateMany({competition: competition._id},          
                { $set: { "humanReadableGrowth" : "0", "growth":"0", "levelUpAmount":"", "rank":null }},);           
                let participants =  await db.CompetitionGrowthTracker.find({competition: competition._id})                  
               
                if(participants.length>0){             
                  let participantsGrowth = await calcaluteGrowthVolume(competition.type, transactions, participants, competition.dexLiquidityPoolCurrencyAddressByNetwork, competition._id, competition.startBlock, leaderboard );
                  await CGTrackerHelper.storeCompetitionGrowth(tokenContractAddress,  competition._id, participantsGrowth)
                  await competitionHelper.updateCompetitionCurrentBlock(competition._id, endBlock)  
                  return res.http200(`competitions growth recalculated for ${tokenContractAddress}`)       
               }      
             return res.http200(`zero participants found for competitionId ${competitionId}`)
           }
           return res.http400(`zero transactions found against ${tokenContractAddress} in CompetitionTransactionsSnapshots`)        
          }
          return res.http400(`CompetitionTransactionsSnapshotMeta don't have active ${tokenContractAddress} record`)        
        }
        return res.http400(`competition leaderboard not found`)  
        }
      return res.http400(`competition not found`)    
    }
    return res.http400('Cron need be paused for competitions growth recalculated')
  }));

  router.get('/recalculate/competitionsGrowth/by/tokenContractAddress/:tokenContractAddress', asyncMiddleware(async (req: any, res: any) => {
    let pauseCron = await db.TemporaryPauseCrons.findOne({cronName:'competitiontransactionssnapshotjob'})   
    const paused = pauseCron ? pauseCron.paused : false
    if(paused){
      const tokenContractAddress = req.params.tokenContractAddress   
      let transactions = await db.CompetitionTransactionsSnapshots.find({contractAddress:tokenContractAddress}) 
      const meta = await db.CompetitionTransactionsSnapshotMeta.findOne({tokenContractAddress, isActive:true})
      
      if(meta){
        const endBlock = meta.currentBlockNumber
     
        if(transactions.length > 0){
          await db.CompetitionGrowthTracker.updateMany({tokenContractAddress},
            { $set: { "humanReadableGrowth" : "0", "growth":"0", "levelUpAmount":"", "rank":null } }
         );
    
          let competitions = await competitionHelper.getActiveCompetitionForGrowth(tokenContractAddress, false);
          for(let i=0; i<competitions.length;i++){
           let participants = await CGTrackerHelper.getCompetitionParticipants(tokenContractAddress, competitions[i]._id, competitions[i])
           if(participants.length>0){
             let participantsGrowth = await calcaluteGrowthVolume(competitions[i].type, transactions, participants, competitions[i].dexLiquidityPoolCurrencyAddressByNetwork, competitions[i]._id, competitions[i].startBlock, competitions[i].leaderboard );
             await CGTrackerHelper.storeCompetitionGrowth(tokenContractAddress, competitions[i]._id, participantsGrowth)
             await competitionHelper.updateCompetitionCurrentBlock(competitions[i]._id, endBlock)
           }
         }
         return res.http200(`competitions growth recalculated for ${tokenContractAddress}`)
       }
       return res.http400(`zero transactions found against ${tokenContractAddress} in CompetitionTransactionsSnapshots`)    
      }
      return res.http400(`CompetitionTransactionsSnapshotMeta don't have active ${tokenContractAddress} record`)    
    }
    return res.http400('Cron need be paused for competitions growth recalculated')    
  }));
 
}
