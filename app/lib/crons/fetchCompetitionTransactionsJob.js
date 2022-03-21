const { db, asyncMiddleware, commonFunctions } = global
var cron = require('node-cron');
const competitions = require('../../models/competitions');
const axios = require('axios').default;

module.exports = function () {
  if (global.environment.isCronEnvironmentSupportedForFindBlockNo === 'yes') {
    start(); 
  }
}

async function start() {
  try {
    const cabns  = await getActiveCABNsOfCompitions()

     cron.schedule('10 * * * * *', () => {      
      cabns.forEach(cabn => {        
        fetchFromBscScan(cabn)
      });

    });
  } catch (e) {
    console.log(e);
  }
}

async function fetchFromBscScan(currencyAddress){
  console.log('currency balance cron triggered')
  axios
  // .get('https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc&page=1&offset=10000&startblock=0&endblock=999999999&sort=asc&apikey=QFQI7J6GMJXYJW6T5GYNGNNFCWI41S21JI')
  .get(`https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${currencyAddress}&page=1&offset=10000&startblock=0&endblock=999999999&sort=asc&apikey=7KWGURV44D717REVIGCY6F4TBARXCQS6XW`)
  .then((response) => {
    let result = response.data.result
    if(result){
      console.log('data recived')
      storeToDB(result)
    }
  })
  .catch((error) => {
    console.log(error);   
  });

}
async function storeToDB(data){
 //console.log({data})
 if(data){
   let temp = data[0]
   console.log(temp)
 }else{
   console('no data')
 }

  // db.TestBalanceTracker.insertMany(data)
 console.log('stored')
}

async function getActiveCABNsOfCompitions(){
 let cabns = []
  let filter = [
    {'$match': {'isActive': true }},     
    {'$lookup': {'from': 'leaderboards','localField': 'leaderboard', 'foreignField': '_id', 'as': 'leaderboard'}},
    {'$unwind': {'path': '$leaderboard', 'preserveNullAndEmptyArrays': true }}, 
    {'$match': {'leaderboard.isActive': true} }, 
    {'$lookup': {'from': 'leaderboardCurrencyAddressesByNetwork', 'localField': 'leaderboard.leaderboardCurrencyAddressesByNetwork','foreignField': '_id',  'as': 'LCABN'}},
    {'$unwind': { 'path': '$LCABN','preserveNullAndEmptyArrays': true }}, 
    {'$match': {'LCABN.isActive': true}},
    {'$lookup': {'from': 'currencyAddressesByNetwork','localField': 'LCABN.currencyAddressesByNetwork','foreignField': '_id', 'as': 'CABN'}},
    {'$unwind': {'path': '$CABN','preserveNullAndEmptyArrays': true }}, 
    {'$match': {'CABN.isActive': true }},
    {'$project':{
      '_id':1,'isActive':1,
      'leaderboard._id':1,'leaderboard.isActive':1,
      'LCABN._id.sActive':1,'LCABN.isActive':1,
      'CABN._ID':1,'CABN.isActive':1,'CABN.tokenContractAddress':1
    }}
  ] 
  $competitions = await db.Competitions.aggregate(filter)

  $competitions.array.forEach(competition => {
    if(competition.CABN)
    cabns.push(competition.CABN.tokenContractAddress)
  });
  return cabns;
}

