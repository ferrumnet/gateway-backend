
module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    logsHelper.createLog(req, res)

  });

  router.put('/update/:id', async (req: any, res: any) => {

    logsHelper.updateLog(req, res)

  });

};
