const { asyncMiddleware, commonFunctions, utils } = global;

const { isValidObjectId } = require("mongoose");
var mongoose = require('mongoose');

module.exports = function (router) {

  router.get("/list", asyncMiddleware(async (req, res) => {
    var filter = {}
    let packages = []

    if (req.query.search) {
      let reg = new RegExp(unescape(req.query.search), 'i');
      filter.name = reg
    }

    if(req.query.isActive){
      filter.isActive = req.query.isActive
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

  router.post("/create", asyncMiddleware(async (req, res) => {
    const productFilter = { _id:req.body.product, isActive:true}
    var payload = utils.pick(req.body, ["name", "product", "price", "limitation", "isFree" ]);
    payload.createdByUser = req.user._id

    if (payload.name && isValidObjectId(payload.product) && payload.price && payload.limitation && typeof payload.isFree == "boolean") {
        const productCount = await db.Product.countDocuments(productFilter)

        if(productCount > 0){
            const package = await db.Package.create(payload);
            return res.http200({ package });
          }
          return res.http400(
              await commonFunctions.getValueFromStringsPhrase( stringHelper.strErrorActiveProductRequired),
              stringHelper.strErrorActiveProductRequired
            );

    }
    return res.http400("Name, product, price, limitation and isFree are required.");

  }));

  router.put("/update/:id", asyncMiddleware(async (req, res) => {
    const filter = { _id:req.params.id }
    const payload = utils.pick(req.body, ["name", "price", "limitation", "isFree" ]);
    payload.createdByUser = req.user._id

    if (payload.name && isValidObjectId(filter._id) && payload.price && payload.limitation && typeof payload.isFree == "boolean") {

        const package = await db.Package.findOneAndUpdate(filter, payload, { new: true });

        return package ? res.http200({ package }) :
        res.http404(
          await commonFunctions.getValueFromStringsPhrase(
            stringHelper.strErrorPackageNotFound
          ),
          stringHelper.strErrorPackageNotFound
        );

    }
      return res.http400("Name, price, limitation, isFree and valid ID are required.");

  }));


  router.get("/:id", asyncMiddleware(async (req, res) => {
    const filter = { _id : req.params.id }

    if (isValidObjectId(filter._id)) {

      const package = await db.Package.findOne(filter);

      return package ? res.http200({ package }) :
         res.http404(
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorPackageNotFound),
          stringHelper.strErrorPackageNotFound
        );

    }

      return res.http400("Valid id is required.");

  }));

  router.put("/active/inactive/:id", asyncMiddleware(async (req, res) => {
    const filter = { _id: req.params.id };
    const payload = {isActive: req.body.active};

    if (isValidObjectId(filter._id) && typeof payload.isActive == "boolean") {

      const package = await db.Package.findOneAndUpdate(filter, payload, { new: true });

      return package ? res.http200({ package }) :
        res.http404(
           await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorPackageNotFound ),
          stringHelper.strErrorPackageNotFound
        );
    }
      return res.http400("Valid id and active is required.");

  }));

};
