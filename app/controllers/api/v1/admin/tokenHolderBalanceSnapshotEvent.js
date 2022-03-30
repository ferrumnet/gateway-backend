const { asyncMiddleware, commonFunctions, utils, db } = global;

module.exports = function (router) {
    router.post("/create", asyncMiddleware(async (req, res) => {
        const user = req.user;
        const orgFilter = {_id: user.organization, isActive:true, user: user._id}
        const lBFilter = {_id: req.body.leaderboard, isActive:true, user: user._id};
        let payload = {
            createdByUser: user._id,
            organization:user.organization,
            type: req.body.type,
            triggeredSnapshotDateTime: req.body.triggeredSnapshotDateTime,
            isActive: true,
            leaderboard: req.body.leaderboard,
        }
        if(payload.type && payload.leaderboard && payload.triggeredSnapshotDateTime){
            const orgCount = await db.Organizations.countDocuments(orgFilter);
            if(orgCount > 0){       
                const lBCount = await db.Leaderboards.countDocuments(lBFilter)
                if(lBCount > 0){
                    const snapEvent = await db.TokenHolderBalanceSnapshotEvent.create(payload);
                    return res.http200({event:snapEvent});
                }
                return res.http404('leaderboard not found')
            }
            return res.http404('org not found')
        }

        return res.http200('Type, Loaderboard and TriggeredSnapshotDateTime are required')
      }));

    router.get("/list", asyncMiddleware(async (req, res) => {
        const user = req.user;
        let events = [];
        let filter = {organization:user.organization}
        
        if(req.query.isActive){
            filter.isActive = req.query.isActive
        }

        if(req.query.status){
            filter.status = req.query.status
        }

        if(req.query.fromDate){
            filter.triggeredSnapshotDateTime = {
                $gte:moment(req.query.fromDate).utc()
            }
        }

        if(req.query.toDate){
            filter.triggeredSnapshotDateTime = {
                $lte:moment(req.query.toDate).utc()
            }
        
        }
        if (req.query.isPagination != null && req.query.isPagination == 'false') {       
            events = await db.TokenHolderBalanceSnapshotEvent.find(filter) .sort({ createdAt: -1 })
        }
        else{
            events = await db.TokenHolderBalanceSnapshotEvent.find(filter) .sort({ createdAt: -1 })
            .sort({ createdAt: -1 })
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)
        }       
        return res.http200(events)
    }));
  };
  