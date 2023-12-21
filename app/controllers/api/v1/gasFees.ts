module.exports = function (router: any) {
  router.get("/:chainId", async (req: any, res: any) => {
    var filter: any = { type: "general" };

    if (req.params.chainId) {
      filter.chainId = req.params.chainId;
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    let gasFees = await db.GasFees.findOne(filter);

    return res.http200({
      gasFees: gasFees,
    });
  });
};
