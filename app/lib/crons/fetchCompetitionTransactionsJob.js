var cron = require("node-cron");
var calcaluteGrowthVolume = require("./crons_helpers/competitionGrowthCalculater");
var bscScanHelper = require("../httpCalls/bscScanHelper");
var CGTrackerHelper = require("../middlewares/helpers/competitionGrowthTrackerHelper");
var cTSnapshotHelper = require("../middlewares/helpers/competitionTransactionsSnapshotHelper");
var competitionHelper = require("../middlewares/helpers/competitionHelper");

module.exports =  async function () {
 if(global.dockerEnvironment.isCronEnvironmentSupportedForCompetitionTransactionsSnapshot === "yes"){
  try{
    //temporary conditions
     //let startBlock = await bscScanHelper.queryBlockNumber(getTimeStamp());
     await cTSnapshotHelper.createSnapshotMeta('0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc', '16309980');
     //end temporary conditions
 
     let isLock = false
     cron.schedule("*/2 * * * *", async () => {
       if(!isLock){
         isLock = true;  
         await transactionSnapshotJob();
         isLock = false 
       }
     });  
  }catch(error){
    console.log(error)
  }
 }
};

const transactionSnapshotJob = async () => {
  try {       
      //for future when we will have multi cabns 
      // approch 1
      //1: get active cabns from active competitions
      //2:  store in snapshotMeta
      // alternative 
      //1: on time of activate competion register with cTSnapshotHelper.createSnapshotMeta  
      console.log('cron')
      snapshotMetas = await cTSnapshotHelper.getActiveSnapshotMetas();    
      console.log('snapshotMetas.lenth' , snapshotMetas.length)  

      if(snapshotMetas.length > 0){      
         let endBlock = await calculateEndBlockNumber();
         for(let i= 0; i<snapshotMetas.length; i++){
                    
          let transations = await bscScanHelper.queryByCABN(snapshotMetas[i].tokenContractAddress, snapshotMetas[i].currentBlockNumber, endBlock.toString());
          //let transations = await bscScanHelper.queryByCABN(snapshotMetas[i].tokenContractAddress, "16310378", "16315222");
          console.log('transations.length',transations.length)
          if(transations.length > 0){                                
            await cTSnapshotHelper.insertTransactionsSnapshot(transations);                        
            await competitionGrowthTrackerJob(snapshotMetas[i].tokenContractAddress, transations, endBlock)                      
          }           
          await cTSnapshotHelper.updateMetaByContractAddress(snapshotMetas[i].tokenContractAddress, snapshotMetas[i].currentBlockNumber, endBlock);
          console.log('job compeleted')                    
        }
      } 
       
  } catch (e) {
    console.log(e);
  }
};


const competitionGrowthTrackerJob = async(tokenContractAddress, transactions, endBlock)=>{
  if(transactions.length > 0){
   let competions = await competitionHelper.getActiveCompetitionForGrowth(tokenContractAddress);
   console.log('competions.lenght=> ',competions.length)
   for(let i=0; i<competions.length;i++){
    let participants = await CGTrackerHelper.getCompetitionParticipants(tokenContractAddress, competions[i]._id)    
    console.log('participants.lenght=> ',participants.length)
    if(participants.length>0){
      let participantsGrowth = await calcaluteGrowthVolume( "tradingVolumeFlow", transactions, participants, competions[i].dexLiquidityPoolCurrencyAddressByNetwork, competions[i]._id ); 
      console.log('participantsGrowth.lenght=> ',participantsGrowth.length)
      await CGTrackerHelper.storeCompetitionGrowth(tokenContractAddress, competions[i]._id, participantsGrowth) 
      await competitionHelper.updateCompetitionCurrentBlock(competions[i]._id, endBlock)         
    }      
  }
}
};

const getTimeStamp = () => {
  return Date.now().toString().substring(0, 10);
};

const calculateEndBlockNumber = async()=>{  
  let endBlock = await bscScanHelper.queryBlockNumber(getTimeStamp());
  endBlock = parseInt(endBlock);
  --endBlock
  return endBlock 
}