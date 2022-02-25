const { asyncMiddleware, commonFunctions, utils } = global;


module.exports = function (router) {

    router.get("/list", asyncMiddleware(async (req, res) => {
      var filter = {}
  
      let Packages = await db.Package.find(filter)
        .sort({ createdAt: -1 })
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
  
        return res.http200({ Packages });
    }));
}