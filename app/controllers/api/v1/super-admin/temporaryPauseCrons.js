const { asyncMiddleware, commonFunctions, utils, db } = global;
const { isValidObjectId } = require("mongoose");

module.exports = function (router) {

  router.post( "/create", asyncMiddleware(async (req, res) => {
    if(req.body.cronName){
      req.body.cronName = (req.body.cronName).toLowerCase()
      const cron = await db.TemporaryPauseCrons.create(req.body)
      return res.http200({cron})
    }
    return res.http400("Unique cronName is required.");
  }))

  router.put( "/active/inactive/:id", asyncMiddleware(async (req, res) => {
    const filter = { _id: req.params.id };
    const payload = { isActive: req.body.active };
    if (isValidObjectId(filter._id) && typeof payload.isActive == "boolean") {
      const cron = await db.TemporaryPauseCrons.findOneAndUpdate( filter, payload, { new: true } );
      return cron
              ? res.http200({ cron })
              : res.http404(
                  await commonFunctions.getValueFromStringsPhrase( stringHelper.strErrorCronNotFound ),
                  stringHelper.strErrorCronNotFound
                );
    }
    return res.http400("Valid id and active status is required.");
  }));

  router.get("/list", asyncMiddleware(async (req, res) => {   
    var filter = {}  
    let crons = []

    if(req.query.isActive){
      filter.isActive = req.query.isActive
    } 
          
    if(req.query.isPagination != null && req.query.isPagination == 'false'){
      crons = await db.TemporaryPauseCrons.find(filter)
      .sort({ createdAt: -1 })
    }else {
      crons = await db.TemporaryPauseCrons.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }
    return res.http200({crons})
  }));

  router.put("/update/:id", asyncMiddleware(async (req, res) => {
    const filter = { _id:req.params.id };
    delete req.body["cronName"]
    delete req.body["pause"]
    if (isValidObjectId(filter._id)) {    
      const cron =  await db.TemporaryPauseCrons.findOneAndUpdate(filter, req.body, { new: true })
      return cron
      ? res.http200({ cron }):    
       res.http404( 
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorCronNotFound),
          stringHelper.strErrorCronNotFound
        );      
    } 
      return res.http400("valid ID is required.");  
  }));


};


