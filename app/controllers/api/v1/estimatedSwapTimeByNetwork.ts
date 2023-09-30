module.exports = function (router: any) {

  router.get('/by/network', async (req: any, res: any) => {
    let filter: any = {}

    if(req.query.sourceNetworkId){
      filter.sourceNetwork = req.query.sourceNetworkId;
    }

    if(req.query.destinationNetworkId){
      filter.destinationNetwork = req.query.destinationNetworkId;
    }

    let estimatedSwapTimeByNetwork = await db.EstimatedSwapTimeByNetwork.findOne(filter)

    return res.http200({
      estimatedSwapTimeByNetwork: estimatedSwapTimeByNetwork
    });

  });

};
