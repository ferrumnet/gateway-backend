module.exports = function (router: any) {
  router.post("/create", async (req: any, res: any) => {
    if (
      !req.body.maxFeePerGas ||
      !req.body.maxPriorityFeePerGas ||
      !req.body.gasLimit
    ) {
      return res.http400(
        "maxFeePerGas & maxPriorityFeePerGas & gasLimit are required."
      );
    }

    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();

    let gasFees = await db.GasFees.create(req.body);

    return res.http200({
      gasFees: gasFees,
    });
  });

  router.put("/update/:id", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.params.id };

    req.body.updatedAt = new Date();

    let gasFees = await db.GasFees.findOneAndUpdate(filter, req.body, {
      new: true,
    });

    return res.http200({
      gasFees: gasFees,
    });
  });

  router.get("/list", async (req: any, res: any) => {
    var filter = {};

    let data = await db.GasFees.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10);

    return res.http200({
      data: data,
    });
  });

  router.get("/:id", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.params.id };

    let gasFees = await db.GasFees.findOne(filter);

    return res.http200({
      gasFees: gasFees,
    });
  });

  router.delete("/:id", async (req: any, res: any) => {
    let filter = {};

    await db.GasFees.remove({ _id: req.params.id });

    return res.http200({
      message: stringHelper.strSuccess,
    });
  });
};
