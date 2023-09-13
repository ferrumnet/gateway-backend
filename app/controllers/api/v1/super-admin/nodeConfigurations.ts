module.exports = function (router: any) {
  router.post("/create", async (req: any, res: any) => {
    if (!req.body.createJobUrl || !req.body.address) {
      return res.http400("createJobUrl & address are required.");
    }

    req.body.createdByUser = req.user._id;
    req.body.updatedByUser = req.user._id;
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();

    let nodeConfiguration = await db.NodeConfigurations.create(req.body);

    return res.http200({
      nodeConfiguration: nodeConfiguration,
    });
  });

  router.put("/update/:id", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.params.id };

    if (!req.body.createJobUrl || !req.body.address) {
      return res.http400("createJobUrl & address are required.");
    }

    req.body.updatedByUser = req.user._id;
    req.body.updatedAt = new Date();

    let nodeConfiguration = await db.NodeConfigurations.findOneAndUpdate(
      filter,
      req.body,
      {
        new: true,
      }
    );

    return res.http200({
      nodeConfiguration: nodeConfiguration,
    });
  });

  router.get("/list", async (req: any, res: any) => {
    var filter = {};

    let nodeConfigurations = await db.NodeConfigurations.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10);

    return res.http200({
      nodeConfigurations: nodeConfigurations,
    });
  });

  router.get("/:id", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.params.id };

    let nodeConfiguration = await db.NodeConfigurations.findOne(filter);

    return res.http200({
      nodeConfiguration: nodeConfiguration,
    });
  });

  router.delete("/:id", async (req: any, res: any) => {
    await db.NodeConfigurations.remove({ _id: req.params.id });

    return res.http200({
      message: stringHelper.strSuccess,
    });
  });
};
