const { asyncMiddleware, commonFunctions, utils } = global;

const { isValidObjectId } = require("mongoose");

module.exports = function (router) {

  router.post("/create", asyncMiddleware(async (req, res) => {
    const productFilter = { _id:req.body.product, isActive:true}
    var payload = utils.pick(req.body, ["name", "product", "price", "limit", "isFree" ]);
    payload.createBy = req.user._id
    if (payload.name && isValidObjectId(payload.product) && payload.price && payload.limit && typeof payload.isFree == "boolean") {      
        const productCount = await db.Product.countDocuments(productFilter) 
        if(productCount > 0){ 
            const package = await db.Package.create(payload);      
            return res.http200({ package });      
          }else{       
            return res.http400(
              await commonFunctions.getValueFromStringsPhrase(
                stringHelper.strErrorActiveProductRequired
              ),
              stringHelper.strErrorActiveProductRequired           
            ); 
          }
    } else {
      return res.http400("Name, product, price, limit and isFree are required.");
    }
  }));

  router.put("/update/:id", asyncMiddleware(async (req, res) => {
    const filter = { _id:req.params.id }
    const payload = utils.pick(req.body, ["name", "price", "limit", "isFree" ]);
    payload.createBy = req.user._id

    if (payload.name && isValidObjectId(filter._id) && payload.price && payload.limit && typeof payload.isFree == "boolean") {
      const packageCount = await db.Package.countDocuments(filter);
      if (packageCount > 0) {
        const package = await db.Package.findOneAndUpdate(filter, payload, { new: true });
        return res.http200({ package });
      } else {

        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(
            stringHelper.strErrorPackageNotFound
          ),
          stringHelper.strErrorPackageNotFound
        );
      }
    } else {
      return res.http400("Name, price, limit, isFree and valid ID are required.");
    }
  }));


  router.get("/:id", asyncMiddleware(async (req, res) => {
    const filter = { _id : req.params.id }
    if (isValidObjectId(filter._id)) {
 
      const package = await db.Package.findOne(filter);
      if (package) {
        return res.http200({ package });
      } else {
        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(
            stringHelper.strErrorPackageNotFound
          ),
          stringHelper.strErrorPackageNotFound 
        );
      }
    } else {
      return res.http400("Valid id is required.");
    }
  }));

  
};
