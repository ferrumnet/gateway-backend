var cron = require("node-cron");
var calcaluteGrowthVolume = global.calcaluteGrowthVolume;
var bscScanHelper = global.bscScanHelper;
var CGTrackerHelper = global.CGTrackerHelper;
var cTSnapshotHelper = global.cTSnapshotHelper;
var competitionHelper = global.competitionHelper;
var db = global.db;

module.exports =  async function () {
 if(global.starterEnvironment.isCronEnvironmentSupportedForCompetitionTransactionsSnapshot === "yes"){
  try{
    //temporary conditions
    //let startBlock = await bscScanHelper.queryBlockNumber(getTimeStamp());
     await cTSnapshotHelper.createSnapshotMeta('0x5732a2a84ec469fc95ac32e12515fd337e143eed', '16565403');
     await cTSnapshotHelper.createSnapshotMeta('0x422a9c44e52a2ea96422f0caf4a00e30b3e26a0d', '16565403');
     //end temporary conditions

     let isLock = false
     cron.schedule("*/2 * * * *", async () => {
     let pauseCron = await db.TemporaryPauseCrons.findOne({cronName:'competitiontransactionssnapshotjob'})
     let cronIsActive = pauseCron._id ? pauseCron.isActive : true 
     
     if(!isLock && cronIsActive){
         isLock = true;
         await transactionSnapshotJob();
         await updateTemporaryPauseCron(pauseCron)
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
      //1: on time of activate competition register with cTSnapshotHelper.createSnapshotMeta
      console.log('cron')
      snapshotMetas = await cTSnapshotHelper.getActiveSnapshotMetas();
      console.log('snapshotMetas.lenth' , snapshotMetas.length)

      if(snapshotMetas.length > 0){
         let endBlock = await calculateEndBlockNumber();
         if(!isNaN(endBlock)){
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

      }

  } catch (e) {
    console.log(e);
  }
};


const competitionGrowthTrackerJob = async(tokenContractAddress, transactions, endBlock)=>{
  if(transactions.length > 0){
   let competitions = await competitionHelper.getActiveCompetitionForGrowth(tokenContractAddress);
   console.log('competitions.lenght=> ',competitions.length)
   for(let i=0; i<competitions.length;i++){
    let participants = await CGTrackerHelper.getCompetitionParticipants(tokenContractAddress, competitions[i]._id, competitions[i])
    console.log('participants.lenght=> ',participants.length)
    if(participants.length>0){
      let participantsGrowth = await calcaluteGrowthVolume(competitions[i].type, transactions, participants, competitions[i].dexLiquidityPoolCurrencyAddressByNetwork, competitions[i]._id, competitions[i].startBlock, competitions[i].leaderboard );
      console.log('participantsGrowth.lenght=> ',participantsGrowth.length)
      await CGTrackerHelper.storeCompetitionGrowth(tokenContractAddress, competitions[i]._id, participantsGrowth)
      await competitionHelper.updateCompetitionCurrentBlock(competitions[i]._id, endBlock)
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

const updateTemporaryPauseCron = async(cron) =>{
  if(cron._id){
    if(cron.paused == isActive){        
      const filter = { _id: req.params.id };      
      const payload = { paused: !cron.paused };     
      console.log(`updating paused status of cron to ${payload.paused}`)     
      await db.TemporaryPauseCrons.findOneAndUpdate(filter, payload)
   }

  }
}