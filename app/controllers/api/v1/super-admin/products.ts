import { isValidObjectId } from "mongoose";

module.exports = function (router: any) {

  router.get("/list", asyncMiddleware(async (req: any, res: any) => {
    var filter: any = {}
    let products = []

    if (req.query.isActive) {
      filter.isActive = req.query.isActive
    }
    if (req.query.search) {
      let reg = new RegExp(unescape(req.query.search), 'i');
      filter.name = reg
    }
    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      products = await db.Product.find(filter)
        .sort({ createdAt: -1 })
    } else {
      products = await db.Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }
    return res.http200({ products })

  }));

  router.post("/create", asyncMiddleware(async (req: any, res: any) => {

    if (!req.body.name) {
      return res.http400('name is required.');
    }

    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.nameInLower = req.body.name
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    const product = await db.Product.create(req.body);
    return res.http200({ product });

  }));

  router.put("/update/:id", asyncMiddleware(async (req: any, res: any) => {
    const filter = { _id: req.params.id };

    if (!req.body.name) {
      return res.http400('name is required.');
    }

    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    const product = await db.Product.findOneAndUpdate(filter, req.body, { new: true })

    if (product) {
      return res.http200({ product });
    }

    return res.http404(
      await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorProductNotFound),
      stringHelper.strErrorProductNotFound
    );

  }));

  router.put("/active/inactive/:id", asyncMiddleware(async (req: any, res: any) => {
    const filter = { _id: req.params.id };
    const payload = { isActive: req.body.isActive };

    if (isValidObjectId(filter._id) && typeof payload.isActive == "boolean") {
      const productCount = await db.Product.countDocuments(filter);

      if (productCount > 0) {
        const product = await db.Product.findOneAndUpdate(filter, payload, { new: true });
        return res.http200({ product });
      }
      return res.http404(
        await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorProductNotFound),
        stringHelper.strErrorProductNotFound
      );

    }
    return res.http400("Valid id and isActive is required.");

  }));

  router.get("/:id", asyncMiddleware(async (req: any, res: any) => {
    const filter = { _id: req.params.id };
    if (isValidObjectId(filter._id)) {
      const product = await db.Product.findOne(filter);
      if (product) {
        return res.http200({ product });
      }
      return res.http404(
        await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorProductNotFound),
        stringHelper.strErrorProductNotFound
      );

    }
    return res.http400("Valid id is required.");

  }));

  router.delete('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }
    console.log(await productsHelper.productAssociationWithPackages(req, res))
    if(await productsHelper.productAssociationWithPackages(req, res) > 0){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorDelete),stringHelper.strErrorDelete,);
    }

    let response = await db.Product.remove(filter)

    return res.http200({
      product: response
    });

  });
};
