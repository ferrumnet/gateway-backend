var cron = require('node-cron');
var uab = require('unique-array-objects');
var axios = require('axios').default;
var filter = {}
var limit = 20

module.exports = function () {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForFindTokenHolders === 'yes') {
    start();
  }
}

async function start() {

  try {

    const scheduler = {};

    let task = cron.schedule('01 */1 * * * *', async () => {
      console.log('fetchTokenHoldersJob cron triggered')
      triggerJobs()
    });

    task.start();


  } catch (e) {
    console.log(e);
  }

}

async function triggerJobs() {
  // let leaderboardFilter = {isPublished: true, status: 'approved'}
  let leaderboardFilter = {isPublished: true}
  let leaderboardCabnFilter: any = {}
  let cabnFilter: any = {}
  let leaderboardIds = await db.Leaderboards.find(leaderboardFilter).distinct('_id')

  if (leaderboardIds && leaderboardIds.length > 0) {
    leaderboardCabnFilter.leaderboard = {$in: leaderboardIds}
    let cabnIds = await db.LeaderboardCurrencyAddressesByNetwork.find(leaderboardCabnFilter).distinct('currencyAddressesByNetwork')
    if (cabnIds && cabnIds.length > 0) {
      console.log(cabnIds)
      cabnIds = await uab(cabnIds)
      console.log("===uab====")
      console.log(cabnIds)

      cabnFilter._id = {$in: cabnIds}
      let cabns = await db.CurrencyAddressesByNetwork.find(cabnFilter)
      fetchTokenHolders(cabns)
    }
  }
}

function fetchTokenHolders(list: any) {

  if (list && list.length > 0) {
    for (let i = 0; i < list.length; i++) {
      (global as any).bscScanTokenHolders.findTokenHolders(list[i])
    }
  }
}
