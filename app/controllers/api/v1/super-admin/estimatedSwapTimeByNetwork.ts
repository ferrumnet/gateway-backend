import { isValidObjectId } from "mongoose";

module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.network || !req.body.time) {
      return res.http400('network & time are required.');
    }

    let count = await db.EstimatedSwapTimeByNetwork.countDocuments({network: req.body.network})
    if (count > 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorEstimatedSwapTimeAlreadyExist), stringHelper.strErrorEstimatedSwapTimeAlreadyExist,);
    }

    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    let estimatedSwapTimeByNetwork = await db.EstimatedSwapTimeByNetwork.create(req.body)

    return res.http200({
      estimatedSwapTimeByNetwork: estimatedSwapTimeByNetwork
    });

  });

  router.put('/update/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.time) {
      return res.http400('time is required.');
    }

    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    let estimatedSwapTimeByNetwork = await db.EstimatedSwapTimeByNetwork.findOneAndUpdate(filter, req.body, { new: true })

    return res.http200({
      estimatedSwapTimeByNetwork: estimatedSwapTimeByNetwork
    });

  });

  router.get('/list', async (req: any, res: any) => {

    var filter = {}

    let estimatedSwapTimeByNetwork = await db.EstimatedSwapTimeByNetwork.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      estimatedSwapTimeByNetwork: estimatedSwapTimeByNetwork
    });

  });

  router.get('/:id', async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id }

    let estimatedSwapTimeByNetwork = await db.EstimatedSwapTimeByNetwork.findOne(filter)

    return res.http200({
      estimatedSwapTimeByNetwork: estimatedSwapTimeByNetwork
    });

  });

  router.delete('/:id', async (req: any, res: any) => {
    let filter = {}

    await db.EstimatedSwapTimeByNetwork.remove({ _id: req.params.id })

    return res.http200({
      message: stringHelper.strSuccess
    });
  })

};
