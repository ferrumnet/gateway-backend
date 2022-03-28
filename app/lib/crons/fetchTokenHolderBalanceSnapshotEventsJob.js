const { db, asyncMiddleware, commonFunctions } = global
var cron = require('node-cron');
var uab = require('unique-array-objects');
const axios = require('axios').default;
let filter = {}
let limit = 20

module.exports = function () {
  if (global.dockerEnvironment.shouldRunOnCronIntance == 'no') {
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

function fetchTokenHolders(list) {
  console.log(list.length)
  if (list && list.length > 0) {
    for (let i = 0; i < list.length; i++) {
      let item = list[i]
      global.timeoutHelper.setSnapshotEventsTimeout(item)
    }
  }
}
