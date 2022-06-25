var cron = require('node-cron');
var uab = require('unique-array-objects');
var axios = require('axios').default;
var filter = {}
var limit = 20

module.exports = function () {
  if ((global as any).starterEnvironment.isCronIntance == 'no') {
    start();
  }
}

async function start() {

  try {
    triggerJobs()
  } catch (e) {
    console.log(e);
  }

}

async function triggerJobs() {
  let filets = {type: 'schedule', status: 'pending', isActive: true}
  let tokenHolderBalanceSnapshotEvents = await db.TokenHolderBalanceSnapshotEvents.find(filets)
  fetchTokenHolders(tokenHolderBalanceSnapshotEvents)
}

function fetchTokenHolders(list: any) {
  console.log(list.length)
  if (list && list.length > 0) {
    for (let i = 0; i < list.length; i++) {
      var item: any = list[i]
      (global as any).timeoutHelper.setSnapshotEventsTimeout(item)
    }
  }
}
