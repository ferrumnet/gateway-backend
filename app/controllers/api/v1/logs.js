
const { db, asyncMiddleware, commonFunctions, stringHelper, logsHelper } = global

module.exports = function (router) {

  router.post('/create', async (req, res) => {
    logsHelper.createLog(req, res)
  });

  router.put('/update/:id', async (req, res) => {
    logsHelper.updateLog(req, res)
  });

};
