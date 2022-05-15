const Web3= require("web3")

module.exports = async (CompetitionType, transations, participants, dex, competionId, competitionStartBlock, leaderboard) => {
  let result = [];
  switch (CompetitionType) {
    case "tradingVolumeFlow":
      result =  calcaluteTradingVolume(transations, participants, dex, competionId, competitionStartBlock, leaderboard);
      break;

    case "purchaseFlow":
      result = calcalutePurchaseVolume(transations, participants, dex, competionId, competitionStartBlock, leaderboard);
      break;

    case "purchaseAndSellFlow":
      result = calcalutePurchaseAndSellVolume(transations, participants, dex, competionId, competitionStartBlock, leaderboard);      
      break;

    default:
    //balance
  }
  return result;
};


const calcaluteTradingVolume = (transactions, participants, dexLiquidityPoolCurrencyAddressByNetwork, competionId, competitionStartBlock, leaderboard) => {
  const dex = dexLiquidityPoolCurrencyAddressByNetwork;
  let toIndex = -1;
  let fromIndex = -1;
  competitionStartBlock = parseInt( competitionStartBlock)
  transactions.forEach((transaction) => {
   if(isNaN(competitionStartBlock) || competitionStartBlock <= parseInt(transaction.blockNumber)){
      toIndex = -1;
      fromIndex = -1;

      toIndex = participants.findIndex(participant => participant.tokenHolderAddress === transaction.to);
      if(dex != transaction.from){
        fromIndex = participants.findIndex(participant => participant.tokenHolderAddress === transaction.from);
      }

      let newparticipant = null
      if(dex != transaction.from){

        if(fromIndex == -1){
          // New participant sell (+ growth)
          newparticipant =  getNewParticipantObject(competionId, transaction, transaction.from, transaction.value)
          participants.push(newparticipant)
        }else{
          // Old participant sell (+ growth)
          participants[fromIndex].growth  = addGrowth(participants[fromIndex].growth, transaction.value)
        }

        if(toIndex == -1 ){
          // new participant purchases from other then dex (0 growth)
          let newparticipant =  getNewParticipantObject(competionId, transaction, transaction.to, "0")
          participants.push(newparticipant)
        }

        //else{ no need to check old participant purchases from other then dex (0 growth)}

      }else{
        //some transaction have multiple records becase some token send transfer fee a saperate records 
         //in case of transfer in,  purchase value = fee + actual amount      
        let transactionValue = calcalutePurchaseAmount(transaction, transactions)
        if(toIndex == -1){
          // New participant purchases from dex (growth = transaction.value)
          newparticipant =  getNewParticipantObject(competionId, transaction, transaction.to, transactionValue)
          participants.push(newparticipant)
        }else{
          // // old participant purchases from dex (+ growth)
          participants[toIndex].growth  =  addGrowth(participants[toIndex].growth, transactionValue)
        }
      }
    }
  });

   const sortedParticipants = sortParticipants(participants)
   return participantsDataCalculation(sortedParticipants, leaderboard)


}

const calcalutePurchaseVolume = (transactions, participants, dexLiquidityPoolCurrencyAddressByNetwork, competionId, competitionStartBlock, leaderboard) => {
   const dex = dexLiquidityPoolCurrencyAddressByNetwork;
   let toIndex = -1;
   let fromIndex = -1;
   competitionStartBlock = parseInt( competitionStartBlock)
   transactions.forEach((transaction) => {
    if(isNaN(competitionStartBlock) || competitionStartBlock <= parseInt(transaction.blockNumber)){
       toIndex = -1;
       fromIndex = -1;
 
       toIndex = participants.findIndex(participant => participant.tokenHolderAddress === transaction.to);
       if(dex != transaction.from){
        fromIndex = participants.findIndex(participant => participant.tokenHolderAddress === transaction.from);
       }
 
       let newparticipant = null
       if(dex != transaction.from){
          // -ve growth
         if(fromIndex == -1){
           // New participant sell (- growth) 
           newparticipant =  getNewParticipantObject(competionId, transaction, transaction.from, '-'+transaction.value)
           participants.push(newparticipant)
         }else{
           // Old participant sell (- growth) 
           participants[fromIndex].growth  = subGrowth(participants[fromIndex].growth, transaction.value)
         }
 
         if(toIndex == -1 ){
           // new participant purchases from other then dex (0 growth)
           let newparticipant =  getNewParticipantObject(competionId, transaction, transaction.to, "0")
           participants.push(newparticipant)
         }
 
         //else{ no need to check old participant purchases from other then dex (0 growth)}
 
       }else{
         //some transaction have multiple records becase some token send transfer fee a saperate records 
         //in case of transfer in,  purchase value = fee + actual amount          
         let transactionValue = calcalutePurchaseAmount(transaction, transactions)
         if(toIndex == -1){
           // New participant purchases from dex (growth = transaction.value)
           newparticipant =  getNewParticipantObject(competionId, transaction, transaction.to, transactionValue)
           participants.push(newparticipant)
         }else{
           // // old participant purchases from dex (+ growth)
           participants[toIndex].growth  =  addGrowth(participants[toIndex].growth, transactionValue)
         }
       }
     }
   });
 
    const sortedParticipants = sortParticipants(participants)
    return participantsDataCalculation(sortedParticipants, leaderboard) 
 }


const calcalutePurchaseAndSellVolume = (transactions, participants, dexLiquidityPoolCurrencyAddressByNetwork, competionId, competitionStartBlock, leaderboard) => {
  const dex = dexLiquidityPoolCurrencyAddressByNetwork;
  let toIndex = -1;
  let fromIndex = -1;
  competitionStartBlock = parseInt( competitionStartBlock)
  transactions.forEach((transaction) => {
   if(isNaN(competitionStartBlock) || competitionStartBlock <= parseInt(transaction.blockNumber)){
      toIndex = -1;
      fromIndex = -1;

      toIndex = participants.findIndex(participant => participant.tokenHolderAddress === transaction.to);
      if(dex != transaction.from){
       fromIndex = participants.findIndex(participant => participant.tokenHolderAddress === transaction.from);
      }

      let newparticipant = null
      if(dex != transaction.from){
                
        // -ve growth
        if(fromIndex == -1){
          if(dex == transaction.to){
             // New participant sell to  dex (+ growth) 
             newparticipant =  getNewParticipantObject(competionId, transaction, transaction.from, transaction.value)
             participants.push(newparticipant)
          }else{
            // New participant sell to non dex (- growth) 
            newparticipant =  getNewParticipantObject(competionId, transaction, transaction.from, '-'+transaction.value)
            participants.push(newparticipant)
          }         
        }else{
          if(dex == transaction.to){
               // Old participant sell dex (+ growth)
               participants[fromIndex].growth  = addGrowth(participants[fromIndex].growth, transaction.value) 
          }else{
            // Old participant sell non dex (- growth) 
            participants[fromIndex].growth  = subGrowth(participants[fromIndex].growth, transaction.value)
          }          
        }

        if(toIndex == -1 ){
          // new participant purchases from other then dex (0 growth)
          let newparticipant =  getNewParticipantObject(competionId, transaction, transaction.to, "0")
          participants.push(newparticipant)
        }

        //else{ no need to check old participant purchases from other then dex (0 growth)}

      }else{
        //some transaction have multiple records becase some token send transfer fee a saperate records 
        //in case of transfer in,  purchase value = fee + actual amount          
        let transactionValue = calcalutePurchaseAmount(transaction, transactions)
        if(toIndex == -1){
          // New participant purchases from dex (growth = transaction.value)
          newparticipant =  getNewParticipantObject(competionId, transaction, transaction.to, transactionValue)
          participants.push(newparticipant)
        }else{
          // // old participant purchases from dex (+ growth)
          participants[toIndex].growth  =  addGrowth(participants[toIndex].growth, transactionValue)
        }
      }
    }
  });

   const sortedParticipants = sortParticipants(participants)
   return participantsDataCalculation(sortedParticipants, leaderboard) 
}

const getNewParticipantObject=(competionId, transaction, tokenHolderAddress, growth )=>{
 return{competion:competionId, tokenContractAddress:transaction.contractAddress ,tokenHolderAddress, growth}
}


const addGrowth = (current, toAdd )=>{
  if(current === '0' || current === undefined){
    return toAdd
  }
  if(toAdd === "0"){
    return current
  }
  toAdd = Web3.utils.toBN(toAdd)
  current = Web3.utils.toBN(current)
  let result= current.add( toAdd)
   return result.toString()
}

const subGrowth = (current, toSub )=>{ 
  if(current === '0' || current === undefined){
    return toSub
  }
  if(toSub === "0"){
    return current
  }
  toSub = Web3.utils.toBN(toSub)
  current = Web3.utils.toBN(current)
  let result= current.sub(toSub)
   return result.toString()
}

const sortParticipants = (participants) =>{
  let sortedParticipants = participants.sort((participant1, participant2) => {
    let participant1Growth = Web3.utils.toBN(participant1.growth)
    let participant2Growth = Web3.utils.toBN(participant2.growth)
    return participant1Growth.lt(participant2Growth) ? 1 : -1
   });
   return sortedParticipants
}
const participantsDataCalculation = (sortedParticipants, leaderboard)=>{
  for(let i=0; i< sortedParticipants.length; i++){
    sortedParticipants[i].rank = i+1
    sortedParticipants[i].humanReadableGrowth = Web3.utils.fromWei(sortedParticipants[i].growth,'ether')
    if(i>0){
      sortedParticipants[i].levelUpAmount = calculateLevelUpAmount(sortedParticipants[i-1].growth, sortedParticipants[i].growth, i )
    }
    let excludedAddress = leaderboard.exclusionWalletAddressList.findIndex((walletAddress)=> walletAddress === sortedParticipants[i].tokenHolderAddress)
    sortedParticipants[i].excludedWalletAddress = excludedAddress != -1
  }
  return sortedParticipants
}

const calculateLevelUpAmount = (previousParticipantGrowth, currentParticipantGrowth, index)=>{
  let levelUpAmount = ""
  let growthFactor = Web3.utils.toBN(Web3.utils.toWei('1', 'ether')) 
  if(index > 0){
    let previousParticipantGrowthBN = Web3.utils.toBN(previousParticipantGrowth) 
     let currentParticipantGrowthBN = Web3.utils.toBN(currentParticipantGrowth)    
     levelUpAmount = previousParticipantGrowthBN.sub(currentParticipantGrowthBN) 
     levelUpAmount = levelUpAmount.add(growthFactor)
    }
    levelUpAmount = Web3.utils.fromWei(levelUpAmount,'ether')
  return levelUpAmount
}


const calcalutePurchaseAmount = (transaction, transactions) => {  
  if(transaction.hash){
    let hashGroup = transactions.filter(record => record.hash ==  transaction.hash)
    if(hashGroup.length > 1){
      let sortedHashGroup = hashGroup.sort((transaction1, transaction2) => {
        let transaction1Value = Web3.utils.toBN(transaction1.value)
        let transaction2Value = Web3.utils.toBN(transaction2.value)
        return transaction1Value.lt(transaction2Value) ? 1 : -1
       });
      
       if(sortedHashGroup[0].value === transaction.value){
        let transactionValue = Web3.utils.toBN(sortedHashGroup[0].value)
        let feeValue = Web3.utils.toBN(sortedHashGroup[1].value)
        let total = transactionValue.add(feeValue)
        return total.toString()
      }  
    }
    return transaction.value
  }
  return '0'
}
