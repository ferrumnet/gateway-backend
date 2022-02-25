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
    const payload = {name:req.body.name, createdBy:req.user.id};
    if (payload.name) {      
      const product = await db.Product.create(payload);
      return res.http200({ product });
    }
      return res.http400("Name is required.");
    
  });

  router.put("/update/:id", async (req, res) => {
    const filter = { _id:req.params.id };
    const payload = {name: req.body.name, createdBy:req.user._id }   
   
    if (payload.name && isValidObjectId(filter._id)) {
      const productCount = await productHelper.countById(filter._id);
      if (productCount > 0) {
        const product =  await db.Product.findOneAndUpdate(filter, payload, { new: true })
        return res.http200({ product });
      } 
      return res.http404(
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorProductNotFound),
          stringHelper.strErrorProductNotFound
        );      
    } 
      return res.http400("Name and valid ID is required.");
    
  });

  router.put("/active/inactive/:id", async (req, res) => {
    const filter = { _id: req.params.id };
    const payload = {isActive: req.body.active};

    if (isValidObjectId(filter._id) && typeof payload.isActive == "boolean") {
      const productCount = await db.Product.countDocuments(filter);
      
      if (productCount > 0) {
        const product = await db.Product.findOneAndUpdate(filter, payload, { new: true });               
        return res.http200({ product });
      } 
        return res.http404(
           await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorProductNotFound ),
          stringHelper.strErrorProductNotFound
        );
      
    }
      return res.http400("Valid id and active is required.");
    
  });

  router.get("/:id", async (req, res) => {
    const filter = { _id:req.params.id };
    if (isValidObjectId(filter._id)) {
      const product = await  db.Product.findOne(filter);
      if (product) {
        return res.http200({ product });
      } 
        return res.http404(
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorProductNotFound ),
          stringHelper.strErrorProductNotFound
        );
      
    } 
      return res.http400("Valid id is required.");
    
  });
};
