const { db } = global;

module.exports = async () => {
  let participants = await db.StakingTracker.find({});
  participants = sortParticipants(participants)
  participants = participantsDataCalculation(participants)
  storeUpdatedGrowth(participants)
};

const sortParticipants = (participants) =>{
  let sortedParticipants = participants.sort((participant1, participant2) => {
    let participant1Growth = Number(participant1.stakedAmount) 
    let participant2Growth =Number(participant2.stakedAmount)  
    return participant1Growth < participant2Growth ? 1 : -1
   });
   return sortedParticipants
}

const participantsDataCalculation = (sortedParticipants)=>{
  for(let i=0; i< sortedParticipants.length; i++){
    sortedParticipants[i].rank = i+1
    if(i>0){
      sortedParticipants[i].levelUpAmount = calculateLevelUpAmount(sortedParticipants[i-1].stakedAmount, sortedParticipants[i].stakedAmount, i )
    }
  }
  return sortedParticipants
}

const calculateLevelUpAmount = (previousParticipantGrowth, currentParticipantGrowth, index)=>{
  let levelUpAmount = ""
  let growthFactor = 1
  if(index > 0){
    let previousParticipantGrowthBN =Number(previousParticipantGrowth) 
    let currentParticipantGrowthBN = Number(currentParticipantGrowth)    
    levelUpAmount =previousParticipantGrowthBN - currentParticipantGrowthBN + growthFactor
    }
    return levelUpAmount.toString()
}

const storeUpdatedGrowth = async(participants) =>{
  let data = [];
        participants.forEach(participant => {
            if(participant){
                data.push({
                    updateOne: {
                        filter: { "user": participants.user, "stakingContractAddress": participant.stakingContractAddress, "stakeHolderWalletAddress": participant.stakeHolderWalletAddress, "tokenContractAddress": participant.tokenContractAddress },
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
       await db.StakingTracker.collection.bulkWrite(data)
}