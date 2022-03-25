
const { db } = global;

module.exports = {
    async getCompetitionParticipants(tokenContractAddress, competitionId){               
        let filter = {tokenContractAddress:tokenContractAddress, competition:competitionId} 
        let participants = await db.CompetitionGrowthTracker.find(filter)
        
        if(participants.length == 0 ){     
            filter = {tokenContractAddress}
            result = await db.TokenHoldersCurrencyAddressesByNetwork.find(filter)                     
            if (result.length == 0) {               
              result = await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.find(filter)         
            }
            //initialize tracker start balances 
            if(result.length > 0){
                result = result.map((item) => ({competition:competitionId, tokenContractAddress: item.tokenContractAddress, tokenHolderAddress: item.tokenHolderAddress, tokenHolderQuantity:item.tokenHolderQuantity }));
                participants = await db.CompetitionGrowthTracker.insertMany(result)
              }
        }
        return participants
    },

 
    async storeCompetitionGrowth(tokenContractAddress, competitionId, participants){           
        let data = [];
        participants.forEach(participant => {
            if(participant){
                data.push({
                    updateOne: {
                        filter: { tokenContractAddress, "competition": competitionId, "tokenHolderAddress":participant.tokenHolderAddress },
                         update: {
                          "$set": {
                            "growth": participant.growth,
                            "rank": participant.rank
                          }
                        },
                        upsert: true                
                    },
                });
            }
        });        
       await db.CompetitionGrowthTracker.bulkWrite(data)
       return true
    }
}
 