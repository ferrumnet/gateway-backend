const { asyncMiddleware, commonFunctions, utils } = global;
const productHelper = require('../../../../lib/middlewares/helpers/productHelper')

const { isValidObjectId } = require("mongoose");
module.exports = function (router) {
  router.get("/list", async (req, res) => {
    const filter = utils.pick(req.query, ["name"]);
    const options = utils.pick(req.query, ["sortBy", "limit", "page"]);
    const products = await productHelper.queryProducts(filter, options);
    return res.http200({ products });
  });

  router.post("/create", async (req, res) => {
    if (req.body.name) {
      const product = await productHelper.create(req.body, req.user.id);
      return res.http200({ product });
    } else {
      return res.http400("Name is required.");
    }
  });

  router.put("/update/:id", async (req, res) => {
    if (req.body.name && isValidObjectId(req.params.id)) {
      const productCount = await productHelper.countById(req.params.id);
      if (productCount > 0) {
        const product = await productHelper.updateById(
          req.params.id,
          req.body.name,
          req.user._id
        );
        return res.http200({ product });
      } else {
        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(
            stringHelper.strErrorProductNotFound
          ),
          stringHelper.strErrorProductNotFound
        );
      }
    } else {
      return res.http400("Name and valid ID is required.");
    }
  });

  router.put("/active/inactive/:id", async (req, res) => {
    if (isValidObjectId(req.params.id) && typeof req.body.active == "boolean") {
      const productCount = await productHelper.countById(req.params.id);
      if (productCount > 0) {
        const product = await productHelper.updateActivationById(req);
        return res.http200({ product });
      } else {
        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(
            stringHelper.strErrorProductNotFound
          ),
          stringHelper.strErrorProductNotFound
        );
      }
    } else {
      return res.http400("Valid id and active is required.");
    }
  });

  router.get("/:id", async (req, res) => {
    if (isValidObjectId(req.params.id)) {
      const product = await productHelper.getById(req.params.id);
      if (product) {
        return res.http200({ product });
      } else {
        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(
            stringHelper.strErrorProductNotFound
          ),
          stringHelper.strErrorProductNotFound
        );
      }
    } else {
      return res.http400("Valid id is required.");
    }
  });
};
