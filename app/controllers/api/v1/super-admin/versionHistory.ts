module.exports = function (router: any) {
  router.post("/", async (req: any, res: any) => {
    if (
      !req.body.walletsVersion ||
      !req.body.networksVersion ||
      !req.body.cabnsVersion
    ) {
      return res.http400(
        "cabnId, walletsVersion and networksVersion are required fields."
      );
    }
    let versionHistory = await db.VersionHistory.find();
    if (versionHistory.length === 0) {
      console.log(versionHistory.length === 0, versionHistory.length);
      versionHistory = await db.VersionHistory.create(req.body);
    }
    return res.http200({
      versionHistory:
        versionHistory.length > 0 ? versionHistory[0] : versionHistory,
    });
  });

  router.patch("/", async (req: any, res: any) => {
    let versionHistory = await db.VersionHistory.find();
    if (versionHistory.length > 0 && versionHistory[0]._id) {
      versionHistory = await db.VersionHistory.findByIdAndUpdate(
        versionHistory[0]._id,
        req.body,
        { new: true }
      );
    }
    return res.http200({
      versionHistory:
        versionHistory.length > 0 ? versionHistory[0] : versionHistory,
    });
  });
};
