var Web3= require("web3")

module.exports = async (CompetitionType: any, transations: any, participants: any, dex: any, competionId: any, competitionStartBlock: any, leaderboard: any) => {
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


const calcaluteTradingVolume = (transactions: any, participants: any, dexLiquidityPoolCurrencyAddressByNetwork: any, competionId: any, competitionStartBlock: any, leaderboard: any) => {
  const dex = dexLiquidityPoolCurrencyAddressByNetwork;
  let toIndex = -1;
  let fromIndex = -1;
  competitionStartBlock = parseInt( competitionStartBlock)
  transactions.forEach((transaction: any) => {
   if(isNaN(competitionStartBlock) || competitionStartBlock <= parseInt(transaction.blockNumber)){
      toIndex = -1;
      fromIndex = -1;

      toIndex = participants.findIndex((participant: any) => participant.tokenHolderAddress === transaction.to);
      if(dex != transaction.from){
        fromIndex = participants.findIndex((participant: any) => participant.tokenHolderAddress === transaction.from);
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

  let excludedAddresses = separateExcludedAddresses(participants, leaderboard)
  excludedAddresses = excludedAddressDataCalculation(excludedAddresses)
  const sortedParticipants = sortParticipants(participants)
  const growths = participantsDataCalculation(sortedParticipants)
  return growths.concat(excludedAddresses)
}

const calcalutePurchaseVolume = (transactions: any, participants: any, dexLiquidityPoolCurrencyAddressByNetwork: any, competionId: any, competitionStartBlock: any, leaderboard: any) => {
   const dex = dexLiquidityPoolCurrencyAddressByNetwork;
   let toIndex = -1;
   let fromIndex = -1;
   let toStakingContractAddressesIndex = -1;
   let fromStakingContractAddressesIndex = -1;
   competitionStartBlock = parseInt( competitionStartBlock)
   transactions.forEach((transaction: any) => {
    if(isNaN(competitionStartBlock) || competitionStartBlock <= parseInt(transaction.blockNumber)){
       toIndex = -1;
       fromIndex = -1;
       if(leaderboard.stakingContractAddresses && leaderboard.stakingContractAddresses.length > 0){
        toStakingContractAddressesIndex = leaderboard.stakingContractAddresses.findIndex((stakingContract: any) =>  stakingContract == transaction.to)
        fromStakingContractAddressesIndex = leaderboard.stakingContractAddresses.findIndex((stakingContract: any) => stakingContract == transaction.from)
      }

       if(toStakingContractAddressesIndex == -1 && fromStakingContractAddressesIndex == -1){

        toIndex = participants.findIndex((participant: any) => participant.tokenHolderAddress === transaction.to);
        if(dex != transaction.from){
          fromIndex = participants.findIndex((participant: any) => participant.tokenHolderAddress === transaction.from);
        }

        let newparticipant = null
        if(dex != transaction.from ){
           // -ve growth
          if(fromIndex == -1){
             // New participant sell (- growth)
            newparticipant = getNewParticipantObject(competionId, transaction, transaction.from, '-'+transaction.value)
            participants.push(newparticipant)
          }else{
            // Old participant sell (- growth)
             participants[fromIndex].growth = subGrowth(participants[fromIndex].growth, transaction.value)
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
        }//else
      }
     }
   });

    let excludedAddresses = separateExcludedAddresses(participants, leaderboard)
    excludedAddresses = excludedAddressDataCalculation(excludedAddresses)
    const sortedParticipants = sortParticipants(participants)
    const growths = participantsDataCalculation(sortedParticipants)
    return growths.concat(excludedAddresses)
 }


const calcalutePurchaseAndSellVolume = (transactions: any, participants: any, dexLiquidityPoolCurrencyAddressByNetwork: any, competionId: any, competitionStartBlock: any, leaderboard: any) => {
  const dex = dexLiquidityPoolCurrencyAddressByNetwork;
  let toIndex = -1;
  let fromIndex = -1;
  competitionStartBlock = parseInt( competitionStartBlock)
  transactions.forEach((transaction: any) => {
   if(isNaN(competitionStartBlock) || competitionStartBlock <= parseInt(transaction.blockNumber)){
      toIndex = -1;
      fromIndex = -1;

      toIndex = participants.findIndex((participant: any) => participant.tokenHolderAddress === transaction.to);
      if(dex != transaction.from){
       fromIndex = participants.findIndex((participant: any) => participant.tokenHolderAddress === transaction.from);
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
  let excludedAddresses = separateExcludedAddresses(participants, leaderboard)
  excludedAddresses = excludedAddressDataCalculation(excludedAddresses)
  const sortedParticipants = sortParticipants(participants)
  const growths = participantsDataCalculation(sortedParticipants)
  return growths.concat(excludedAddresses)
}

const getNewParticipantObject=(competionId: any, transaction: any, tokenHolderAddress: any, growth: any )=>{
 return{competion:competionId, tokenContractAddress:transaction.contractAddress ,tokenHolderAddress, growth}
}


const addGrowth = (current: any, toAdd: any )=>{
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

const subGrowth = (current: any, toSub: any )=>{
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

const sortParticipants = (participants: any) =>{
  let sortedParticipants = participants.sort((participant1: any, participant2: any) => {
    let participant1Growth = Web3.utils.toBN(participant1.growth)
    let participant2Growth = Web3.utils.toBN(participant2.growth)
    return participant1Growth.lt(participant2Growth) ? 1 : -1
   });
   return sortedParticipants
}
const participantsDataCalculation = (sortedParticipants: any)=>{
  for(let i=0; i< sortedParticipants.length; i++){
    sortedParticipants[i].rank = i+1
    sortedParticipants[i].humanReadableGrowth = Web3.utils.fromWei(sortedParticipants[i].growth,'ether')
    if(i>0){
      sortedParticipants[i].levelUpAmount = calculateLevelUpAmount(sortedParticipants[i-1].growth, sortedParticipants[i].growth, i )
    }
  }
  return sortedParticipants
}

const separateExcludedAddresses = (participants: any, leaderboard: any) =>{
  let excludedAddress = []
  for(let i=0; i<= leaderboard.exclusionWalletAddressList.length; i++){
   let index = participants.findIndex((participant: any)=> leaderboard.exclusionWalletAddressList[i] === participant.tokenHolderAddress)
   if(index != -1){
    excludedAddress.push(participants[index])
    participants.splice(index,1)
   }
  }
  return excludedAddress
}

const excludedAddressDataCalculation = (excludedParticipants: any) => {
  for(let i=0; i< excludedParticipants.length; i++){
    excludedParticipants[i].rank = null
    excludedParticipants[i].humanReadableGrowth = Web3.utils.fromWei(excludedParticipants[i].growth,'ether')
    excludedParticipants[i].levelUpAmount = "0";
    excludedParticipants[i].excludedWalletAddress = true
  }
  return excludedParticipants
}

const calculateLevelUpAmount = (previousParticipantGrowth: any, currentParticipantGrowth: any, index: any)=>{
  let levelUpAmount: any = ""
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


const calcalutePurchaseAmount = (transaction: any, transactions: any) => {
  if(transaction.hash){
    let hashGroup = transactions.filter((record: any) => record.hash ==  transaction.hash)
    if(hashGroup.length > 1){
      let sortedHashGroup = hashGroup.sort((transaction1: any, transaction2: any) => {
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
