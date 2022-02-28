const { asyncMiddleware, commonFunctions, utils } = global;


module.exports = function (router) {

    router.get("/list", asyncMiddleware(async (req, res) => {
      var filter = {isActive:true}
      let packages = []
  
      if (req.query.search) {
  
        let reg = new RegExp(unescape(req.query.search), 'i');
        filter.name = reg
  
      }
            
      if(req.query.isPagination != null && req.query.isPagination == 'false'){
  
        packages = await db.Package.find(filter).populate('product')
        .sort({ createdAt: -1 })
  
      }else {
  
        packages = await db.Package.find(filter).populate('product')
        .sort({ createdAt: -1 })
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
  
      }
      return res.http200({packages})
    }));
}