module.exports = function (router: any) {
  router.get("/list", async (req: any, res: any) => {
    var filter: any = {};
    let data;
    if (req.query.address) {
      filter.address = req.query.address.toLowerCase();
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.isPagination != null && req.query.isPagination == "false") {
      data = await db.RpcNodes.find(filter).sort({ createdAt: -1 });
    } else {
      data = await db.RpcNodes.find(filter)
        .sort({ createdAt: -1 })
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10);
    }
    return res.http200({
      data: data,
    });
  });
};
