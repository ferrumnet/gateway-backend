module.exports = function (router: any) {

  router.get('/by/network', async (req: any, res: any) => {
    let filter = {}
    filter = { network: req.query.networkId }

    let estimatedSwapTimeByNetwork = await db.EstimatedSwapTimeByNetwork.findOne(filter)

    return res.http200({
      estimatedSwapTimeByNetwork: estimatedSwapTimeByNetwork
    });

  });

};
