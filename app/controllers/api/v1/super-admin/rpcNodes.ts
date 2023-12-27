module.exports = function (router: any) {
  router.post("/create", async (req: any, res: any) => {
    if (
      !req.body.address ||
      !req.body.url ||
      !req.body.type ||
      !req.body.chainId
    ) {
      return res.http400("address & url & type & chainId are required.");
    }
    let count = await db.RpcNodes.countDocuments({
      address: req.body.address,
      url: req.body.url,
      type: req.body.type,
    });
    if (count > 0) {
      // save this string into pharase
      return res.http400(stringHelper.strErrorNodePairAlreadyExist);
    }
    req.body.address = req.body.address.toLowerCase();
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();
    let rpcNode = await db.RpcNodes.create(req.body);
    return res.http200({
      rpcNode: rpcNode,
    });
  });

  router.put("/update/:id", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.params.id };
    if (
      !req.body.address ||
      !req.body.url ||
      !req.body.type ||
      !req.body.chainId
    ) {
      return res.http400("address & url & type & chainId are required.");
    }
    req.body.address = req.body.address.toLowerCase();
    let count = await db.RpcNodes.countDocuments({
      address: req.body.address,
      url: req.body.url,
      type: req.body.type,
      _id: { $ne: req.params.id },
    });
    if (count > 0) {
      // save this string into pharase
      return res.http400(stringHelper.strErrorNodePairAlreadyExist);
    }
    req.body.updatedAt = new Date();
    let rpcNode = await db.RpcNodes.findOneAndUpdate(filter, req.body, {
      new: true,
    });
    return res.http200({
      rpcNode: rpcNode,
    });
  });

  router.get("/list", async (req: any, res: any) => {
    var filter = {};
    let data = await db.RpcNodes.find(filter)
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
    let rpcNode = await db.RpcNodes.findOne(filter);
    return res.http200({
      rpcNode: rpcNode,
    });
  });

  router.delete("/:id", async (req: any, res: any) => {
    await db.RpcNodes.remove({ _id: req.params.id });
    return res.http200({
      message: stringHelper.strSuccess,
    });
  });
};
