
const { asyncMiddleware, commonFunctions, utils, db } = global;


module.exports = function (router) {

router.post("/create", asyncMiddleware(async (req, res) => {
    const orgFilter = {user:req.user.id, _id:req.body.organization }
    const packFilter = {_id: req.body.package, isActive: true}
    const payload = {organization:req.body.organization, package:req.body.package, usedLimit:0, createdByUser:req.user.id};   
    const org = await db.Organizations.countDocuments(orgFilter) 
    if(org > 0){
        const package = await db.Package.find(packFilter)
        if(package){
            payload.actualLimit = package.limitation         
            const subscription = await db.Subscription.create(payload)
            return res.http200(subscription)
        }
    }
    return res.http403('action not allowed')
    
  }));

  router.get("/of/associated/organization", asyncMiddleware(async (req, res) => {  
    const filter = {organization:req.user.organization }
    const subscription = await db.Subscription.find(filter)
    return res.http200(subscription)  
  }));

}