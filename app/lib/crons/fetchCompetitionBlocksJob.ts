var cron = require('node-cron');
var axios = require('axios').default;
var moment = require("moment");
var filter = {}
var limit = 20

module.exports = function () {
  triggerJobsIfNeededOnRestartServer()
  if ((global as any).environment.isCronEnvironmentSupportedForFindBlockNo === 'yes') {
    start();
  }
}

async function start() {

  try {

    const scheduler = {};

    let task = cron.schedule('20 */2 * * * *', async () => {
      console.log('fetchCompetitionBlocksJob cron triggered')
      triggerMissedJobs()
    });

    task.start();


  } catch (e) {
    console.log(e);
  }

}

async function triggerJobsIfNeededOnRestartServer() {
  let jobIds = await db.Jobs.find().distinct('_id')
  if (jobIds && jobIds.length > 0) {
    for (let i = 0; i < jobIds.length; i++) {
      (global as any).commonFunctions.triggerAndSetTimeout(jobIds[i])
    }
  }
}

async function triggerMissedJobs() {
  var matchFilter: any = {}
  var filterOrList= []
  var filterAndList= []
  var filter = []
  let now = moment().utc().subtract(2,'minutes')
  console.log(new Date(now))

  filterOrList.push({"competition.startDateAfterDelay": {$lte: new Date(now)} })
  filterOrList.push({"competition.endDateAfterDelay": {$lte: new Date(now)} })

  if(filterOrList && filterOrList.length > 0){
    matchFilter.$or = []
    matchFilter.$or.push({$or: filterOrList})
  }

  filter = [
    { $lookup: { from: 'competitions', localField: 'competition', foreignField: '_id', as: 'competition' } },
    { "$unwind": { "path": "$competition","preserveNullAndEmptyArrays": true}},
    { "$match": matchFilter }
  ];

  let jobs = await db.Jobs.aggregate(filter);
  if (jobs && jobs.length > 0) {
    for (let i = 0; i < jobs.length; i++) {
      (global as any).commonFunctions.triggerAndSetTimeout(jobs[i]._id)
    }
  }
}
