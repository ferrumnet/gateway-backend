const { db } = global;
const Web3= require("web3")

module.exports = {
  
  async calculate(stakingContractAddress){
  let participants = await db.StakingsTracker.find({stakingContractAddress});
  participants = this.sortParticipants(participants)
  participants = this.participantsDataCalculation(participants)
  this.storeUpdatedGrowth(participants)
},

 sortParticipants(participants){
  let sortedParticipants = participants.sort((participant1, participant2) => {
    let participant1Growth = Number(participant1.totalStakedAmount) 
    let participant2Growth =Number(participant2.totalStakedAmount)  
    return participant1Growth < participant2Growth ? 1 : -1
   });
   return sortedParticipants
},

 participantsDataCalculation(sortedParticipants){
  for(let i=0; i< sortedParticipants.length; i++){
    sortedParticipants[i].rank = i+1
    if(i>0){
      sortedParticipants[i].levelUpAmount = this.calculateLevelUpAmount(sortedParticipants[i-1].totalStakedAmount, sortedParticipants[i].totalStakedAmount, i )
    }
  }
  return sortedParticipants
},

 calculateLevelUpAmount(previousParticipantGrowth, currentParticipantGrowth, index){
  let levelUpAmount = ""
  let growthFactor = 1
  if(index > 0){
    let previousParticipantGrowthBN =Number(previousParticipantGrowth) 
    let currentParticipantGrowthBN = Number(currentParticipantGrowth)    
    levelUpAmount =previousParticipantGrowthBN - currentParticipantGrowthBN + growthFactor
    }
    return levelUpAmount.toString()
},

async storeUpdatedGrowth(participants){
  let data = [];
        participants.forEach(participant => {
            if(participant){
                data.push({
                    updateOne: {
                        filter: { "user": participant.user, "stakingContractAddress": participant.stakingContractAddress, "stakeHolderWalletAddress": participant.stakeHolderWalletAddress, "tokenContractAddress": participant.tokenContractAddress },
                         update: {
                          "$set": {
                            "levelUpAmount": participant.levelUpAmount,
                            "rank": participant.rank
                          },
                        },
                        upsert: true
                    },
                });
            }
        });
      await db.StakingsTracker.collection.bulkWrite(data)
},

async intiatParticipentsData(tokenContractAddress, stakingContractAddress){

   let filter = {tokenContractAddress, stakingContractAddress}
        let participants = await db.StakingsTracker.find(filter)

        if(participants.length == 0 ){
          const cabn = await db.CurrencyAddressesByNetwork.findOne({tokenContractAddress})
          if(cabn){
            let tokenHoldersCurrencyAddressesByNetworkFilter = {currencyAddressesByNetwork: cabn._id}
            result = await db.TokenHoldersCurrencyAddressesByNetwork.find(tokenHoldersCurrencyAddressesByNetworkFilter)
            if (result.length == 0) {
              result = await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.find(tokenHoldersCurrencyAddressesByNetworkFilter)
            }
            if(result.length > 0){
                result = result.map((item) => {
                  let stakedAmount =  Web3.utils.fromWei(item.tokenHolderQuantity,'ether')
                  return {stakingContractAddress, tokenContractAddress: item.tokenContractAddress, stakeHolderWalletAddress: item.tokenHolderAddress, intialBalance: stakedAmount, totalStakedAmount: stakedAmount}
                });
                result = this.sortParticipants(result)
                result = this.participantsDataCalculation(result)
                participants = await db.StakingsTracker.insertMany(result)
              }
          }
  
        }
        return participants
}
}