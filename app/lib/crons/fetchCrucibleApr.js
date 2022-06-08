const { crucibleAprsHelper } = global
var cron = require('node-cron');
var uab = require('unique-array-objects');
const axios = require('axios').default;
let filter = {}
let limit = 20

module.exports = function () {
  if (global.starterEnvironment.isCronEnvironmentSupportedForCrucibleApr === 'yes') {
    start();
  }
}

async function start() {

  try {

    const scheduler = {};

    let task = cron.schedule('0 0 */1 * * *', async () => {
      console.log('fetchCrucibleApr cron triggered:::')
      console.log(new Date())
      triggerJobs()
    });

    task.start();


  } catch (e) {
    console.log(e);
  }

}

async function triggerJobs() {
  crucibleAprsHelper.crucibleAutoCalculateApr(null, null, false)
}
