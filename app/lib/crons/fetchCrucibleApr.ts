var cron = require('node-cron');
var uab = require('unique-array-objects');
var axios = require('axios').default;
var filter = {}
var limit = 20

module.exports = function () {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForCrucibleApr === 'yes') {
    start();
  }
}

async function start() {

  try {

    const scheduler = {};

    let task = cron.schedule('30 */30 * * * *', async () => {
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
  await crucibleAprsHelper.crucibleAutoCalculateApr(null, null, false)
}
