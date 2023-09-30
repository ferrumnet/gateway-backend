
module.exports = {
    async getCompetitionParticipants(tokenContractAddress: any, competitionId: any, competion: any){
        let filter = {tokenContractAddress:tokenContractAddress, competition:competitionId}
        let participants = await db.CompetitionGrowthTracker.find(filter)

        if(participants.length == 0 ){
            let tokenHoldersCurrencyAddressesByNetworkFilter = {currencyAddressesByNetwork: competion.CABN._id}
            console.log(tokenHoldersCurrencyAddressesByNetworkFilter)
            var result = await db.TokenHoldersCurrencyAddressesByNetwork.find(tokenHoldersCurrencyAddressesByNetworkFilter)
            if (result.length == 0) {
              result = await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.find(tokenHoldersCurrencyAddressesByNetworkFilter)
            }
            //initialize tracker start balances
            if(result.length > 0){
                result = result.map((item: any) => ({competition:competitionId, tokenContractAddress: item.tokenContractAddress, tokenHolderAddress: item.tokenHolderAddress, tokenHolderQuantity:item.tokenHolderQuantity }));
                participants = await db.CompetitionGrowthTracker.insertMany(result)
              }
        }
        return participants
    },

    async storeCompetitionGrowth(tokenContractAddress: any, competitionId: any, participants: any){
        let data: any = [];
        participants.forEach((participant: any) => {
            if(participant){
                data.push({
                    updateOne: {
                        filter: { tokenContractAddress, "competition": competitionId, "tokenHolderAddress":participant.tokenHolderAddress },
                         update: {
                          "$set": {
                            "growth": participant.growth,
                            "humanReadableGrowth": participant.humanReadableGrowth,
                            "levelUpAmount": participant.levelUpAmount,
                            "rank": participant.rank,
                            "excludedWalletAddress": participant.excludedWalletAddress
                          },
                        },
                        upsert: true
                    },
                });
            }
        });
       await db.CompetitionGrowthTracker.collection.bulkWrite(data)
       return true
    }
}
