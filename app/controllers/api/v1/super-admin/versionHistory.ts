module.exports = function (router: any) {
  router.patch("/", async (req: any, res: any) => {
    let versionHistory = await db.VersionHistory.find();
    if (versionHistory.length > 0 && versionHistory[0]._id) {
      versionHistory = await db.VersionHistory.findByIdAndUpdate(
        versionHistory[0]._id,
        req.body,
        { new: true }
      );
    } else if (versionHistory.length === 0) {
      versionHistory = await db.VersionHistory.create(req.body);
    }
    return res.http200({
      versionHistory:
        versionHistory.length > 0 ? versionHistory[0] : versionHistory,
    });
  });
};
