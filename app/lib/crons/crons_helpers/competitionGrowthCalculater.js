const Web3= require("web3")

module.exports = async (CompetitionType, transations, participants, dex, competionId, competitionStartBlock) => {
  let result = [];
  switch (CompetitionType) {
    case "tradingVolumeFlow":
      result =  calcaluteTradingVolume(transations, participants, dex, competionId, competitionStartBlock);
    
      break;
    case "purchaseFlow":
      //CalcalutePurchase
      break;
    default:
    //balance
  }
  return result;
};


const calcaluteTradingVolume = (transactions, participants, dexLiquidityPoolCurrencyAddressByNetwork, competionId, competitionStartBlock) => {
 const dex = dexLiquidityPoolCurrencyAddressByNetwork;
  let toIndex = -1;
  let formIndex = -1;
  competitionStartBlock = parseInt( competitionStartBlock)
  transactions.forEach((transaction) => {
   if(isNaN(competitionStartBlock) || competitionStartBlock >= parseInt(transaction.blockNumber)){         
      toIndex = -1;   
      formIndex = -1;
      
      toIndex = participants.findIndex(participant => participant.tokenHolderAddress === transaction.to);   
      if(dex != transaction.form){   
        formIndex = participants.findIndex(participant => participant.tokenHolderAddress === transaction.form);
      }
       
      let newparticipant = null   
      if(dex != transaction.form){      
   
        if(formIndex == -1){          
          // New participant sell (+ growth)               
          newparticipant =  getNewParticipantObject(competionId, transaction, transaction.from, transaction.value)                 
          participants.push(newparticipant)      
        }else{        
          // Old participant sell (+ growth)          
          participants[formIndex].growth  = addGrowth(participants[formIndex].growth, transaction.value)    
        }
           
        if(toIndex == -1 ){
          // new participant purchases from other then dex (0 growth)          
          let newparticipant =  getNewParticipantObject(competionId, transaction, transaction.to, "0")                  
          participants.push(newparticipant)      
        }  
    
        //else{ no need to check old participant purchases from other then dex (0 growth)}
  
      }else{   
        if(toIndex == -1){     
          // New participant purchases from dex (growth = transaction.value)     
          newparticipant =  getNewParticipantObject(competionId, transaction, transaction.to, transaction.value)     
          participants.push(newparticipant)    
        }else{      
          // // old participant purchases from dex (+ growth)      
          participants[toIndex].growth  =  addGrowth(participants[toIndex].growth, transaction.value)         
        }  
      }
    }
  });
  
   const sortedParticipants = sortParticipants(participants)
   return participantsDataCalculation(sortedParticipants)


}

const getNewParticipantObject=(competionId, transaction, tokenHolderAddress, growth )=>{
  if(growth != "0"){
    growth = Web3.utils.fromWei(growth, 'ether')
    growth = growth.toString()
  }
 return{competion:competionId, tokenContractAddress:transaction.contractAddress ,tokenHolderAddress, growth}
}


const addGrowth = (current , toAdd )=>{ 
  if(current === '0' || current === undefined){
    return Web3.utils.fromWei(toAdd, 'ether')
  }
  if(toAdd === "0"){
    return current
  }
   toAdd = Web3.utils.fromWei(toAdd, 'ether')

   let result = Number(toAdd)+ Number(current)
   return  result.toString()
}

const sortParticipants = (participants) =>{
  let sortedParticipants = participants.sort((participant1, participant2) => {
    let participant1Growth = Number(participant1.growth) 
    let participant2Growth =Number(participant2.growth)  
    return participant1Growth < participant2Growth ? 1 : -1
   });
   return sortedParticipants
}
const participantsDataCalculation = (sortedParticipants)=>{
  for(let i=0; i< sortedParticipants.length; i++){ 
    sortedParticipants[i].rank = i+1
    sortedParticipants[i].humanReadableGrowth = sortedParticipants[i].growth
    if(i>0){
      sortedParticipants[i].levelUpAmount = calculateLevelUpAmount(sortedParticipants[i-1].growth, sortedParticipants[i].growth, i )
    }
  }
  return sortedParticipants
}

const calculateLevelUpAmount = (previousParticipantGrowth, currentParticipantGrowth, index)=>{
  let levelUpAmount = ""
  let growthFactor =  1
  if(index > 0){
     let previousParticipantGrowthBN =Number(previousParticipantGrowth) 
     let currentParticipantGrowthBN = Number(currentParticipantGrowth)    
     levelUpAmount =previousParticipantGrowthBN - currentParticipantGrowthBN + growthFactor
  }
  return levelUpAmount.toString()
}

