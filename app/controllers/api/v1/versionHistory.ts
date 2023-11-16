module.exports = function (router: any) {
  router.get("/", async (req: any, res: any) => {
    let versionHistory = await db.VersionHistory.find();
    return res.http200({
      versionHistory: versionHistory.length > 0 ? versionHistory[0] : {},
    });
  });
};
