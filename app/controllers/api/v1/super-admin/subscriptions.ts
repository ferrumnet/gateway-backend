import { isValidObjectId } from "mongoose";

module.exports = function (router: any) {
  router.put( "/active/inactive/:id", asyncMiddleware(async (req: any, res: any) => {
      const filter = { _id: req.params.id };
      const payload = { isActive: req.body.active };
      
      if (isValidObjectId(filter._id) && typeof payload.isActive == "boolean") {

        const subscription = await db.Subscription.findOneAndUpdate( filter, payload, { new: true } );
        return subscription
          ? res.http200({ subscription })
          : res.http404(
              await commonFunctions.getValueFromStringsPhrase( stringHelper.strErrorSubscriptionNotFound ),
              stringHelper.strErrorSubscriptionNotFound
            );

      }
      return res.http400("Valid id and active status is required.");
    })
  );

  router.get("/list", asyncMiddleware(async (req: any, res: any) => {   
    var filter: any = {}  
    let subscriptions = []

    if(req.query.isActive){
      filter.isActive = req.query.isActive
    } 
          
    if(req.query.isPagination != null && req.query.isPagination == 'false'){
      subscriptions = await db.Subscription.find(filter)
      .sort({ createdAt: -1 })
    }else {
      subscriptions = await db.Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }
    return res.http200({subscriptions})
 
  }));

  router.get("/organization/:id", asyncMiddleware(async (req: any, res: any) => {
    const filter = { organization:req.params.id };
    if (isValidObjectId(filter.organization)) {
      const subscriptions = await  db.Subscription.find(filter);
     return subscriptions
     ? res.http200({ subscriptions }):     
       res.http404(
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSubscriptionNotFound),
          stringHelper.strErrorSubscriptionNotFound
        );
      
    } 
      return res.http400("Valid id is required.");
    
  }));

  router.put("/update/:id", asyncMiddleware(async (req: any, res: any) => {
    const filter = { _id:req.params.id };
    const payload = {actualLimit: req.body.actualLimit, usedLimit:req.body.usedLimit }   

    if (payload.actualLimit && payload.usedLimit && isValidObjectId(filter._id)) {
     
      const subscription =  await db.Subscription.findOneAndUpdate(filter, payload, { new: true })
      return subscription
      ? res.http200({ subscription }):    
       res.http404( 
          await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSubscriptionNotFound),
          stringHelper.strErrorSubscriptionNotFound
        );      
    } 
      return res.http400("Name and valid ID is required.");
    
  }));


};


