const { asyncMiddleware, commonFunctions, utils } = global;


const { isValidObjectId } = require("mongoose");
module.exports = function (router) {

  router.get("/list", asyncMiddleware(async (req, res) => {   
    var filter = {}  
    let products = []

    if(req.query.isActive){
      filter.isActive = req.query.isActive
    } 
    if (req.query.search) {
      let reg = new RegExp(unescape(req.query.search), 'i');
      filter.name = reg
    }         
    if(req.query.isPagination != null && req.query.isPagination == 'false'){
      products = await db.Product.find(filter)
      .sort({ createdAt: -1 })
    }else {
      products = await db.Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }
    return res.http200({products})
 
  }));

  router.post("/create", asyncMiddleware(async (req, res) => {
    const payload = {name:req.body.name, createdByUser:req.user.id};
    if (payload.name) { 
      const product = await db.Product.create(payload);
      return res.http200({ product });
    }
      return res.http400("Name is required.");
    
  }));

  router.put("/update/:id", asyncMiddleware(async (req, res) => {
    const filter = { _id:req.params.id };
    const payload = {name: req.body.name, createdByUser:req.user._id }   
   
    if (payload.name && isValidObjectId(filter._id)) {
      const productCount = await db.Product.countDocuments(filter);
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
    
  }));

  router.put("/active/inactive/:id", asyncMiddleware(async (req, res) => {
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
    
  }));

  router.get("/:id", asyncMiddleware(async (req, res) => {
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
    
  }));
};
