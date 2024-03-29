import { isValidObjectId } from "mongoose";

module.exports = function (router: any) {

  router.get("/list", asyncMiddleware(async (req: any, res: any) => {
    var filter: any = {}
    let packages = []

    if (req.query.search) {
      let reg = new RegExp(unescape(req.query.search), 'i');
      filter.name = reg
    }

    if (req.query.isActive) {
      filter.isActive = req.query.isActive
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      packages = await db.Package.find(filter).populate('product')
        .sort({ createdAt: -1 })
    } else {
      packages = await db.Package.find(filter).populate('product')
        .sort({ createdAt: -1 })
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }
    return res.http200({ packages })

  }));

  router.post("/create", asyncMiddleware(async (req: any, res: any) => {
    const productFilter = { _id: req.body.product, isActive: true }
    var payload: any = utils.pick(req.body, ["name", "product", "price", "limitation", "isFree"]);
    payload.createdByUser = req.user._id

    if (payload.name && isValidObjectId(payload.product) && payload.price && payload.limitation && typeof payload.isFree == "boolean") {
      const productCount = await db.Product.countDocuments(productFilter)

      if (productCount > 0) {
        if(req.body.name){
          payload.nameInLower = req.body.name
        }
        const packageRes = await db.Package.create(payload);
        return res.http200({ package: packageRes });
      }
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorActiveProductRequired),
        stringHelper.strErrorActiveProductRequired
      );

    }
    return res.http400("Name, product, price, limitation and isFree are required.");

  }));

  router.put("/update/:id", asyncMiddleware(async (req: any, res: any) => {
    const filter = { _id: req.params.id }
    const payload = utils.pick(req.body, ["name", "price", "limitation", "isFree"]);
    payload.createdByUser = req.user._id

    if (payload.name && isValidObjectId(filter._id) && payload.price && payload.limitation && typeof payload.isFree == "boolean") {

      const packageRes = await db.Package.findOneAndUpdate(filter, payload, { new: true });

      if (packageRes) {
        return res.http200({ package: packageRes })
      }else {
        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorPackageNotFound),
          stringHelper.strErrorPackageNotFound
        );
      }

    }
    return res.http400("Name, price, limitation, isFree and valid ID are required.");

  }));

  router.get("/:id", asyncMiddleware(async (req: any, res: any) => {
    const filter = { _id: req.params.id }

    if (isValidObjectId(filter._id)) {

      const packageRes = await db.Package.findOne(filter);

      if (packageRes) {
        return res.http200({ package: packageRes })
      }else {
        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorPackageNotFound),
          stringHelper.strErrorPackageNotFound
        );
      }

    }

    return res.http400("Valid id is required.");

  }));

  router.put("/active/inactive/:id", asyncMiddleware(async (req: any, res: any) => {
    const filter = { _id: req.params.id };
    const payload = { isActive: req.body.isActive };

    if (isValidObjectId(filter._id) && typeof payload.isActive == "boolean") {

      const packageRes = await db.Package.findOneAndUpdate(filter, payload, { new: true });

      if (packageRes) {
        return res.http200({ package: packageRes })
      }else {
        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorPackageNotFound),
          stringHelper.strErrorPackageNotFound
        );
      }

    }
    return res.http400("Valid id and isActive is required.");

  }));

  router.delete('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }
    console.log(await packagesHelper.packageAssociationWithSubscription(req, res))
    if(await packagesHelper.packageAssociationWithSubscription(req, res) > 0){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorDelete),stringHelper.strErrorDelete,);
    }

    let response = await db.Package.remove(filter)

    return res.http200({
      package: response
    });

  });

};
