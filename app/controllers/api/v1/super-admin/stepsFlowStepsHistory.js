const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.put('/update/status/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!(req.body.status).toString()) {

            return res.http400('status option is required for status update.');

        }

        const stepFlowStepsHistory = await db.StepFlowStepsHistory.findOne(filter);

        if(stepFlowStepsHistory){


            req.body.updatedByUser = req.user._id
            req.body.updatedAt = new Date()
        
            const stepFlowStepsHistory = await db.StepFlowStepsHistory.findOneAndUpdate(filter, req.body, { new: true });
            
            return res.http200({
                stepsHistory: stepFlowStepsHistory
            });

        }
        
        return res.http400('user stepFlowStepsHistory not found');

    })


    router.get('/list', async (req, res) => {

        let stepFlowStepsHistory = []

        let filter =  [
            {$match: {$and: [{ user: req.user._id},{ stepFlow: mongoose.Types.ObjectId(req.params.id)}]}},
            {$lookup:{from: "stepFlowSteps",localField: "stepFlow",foreignField: "stepsFlow",as: "stepFlowStep"}},
            {$unwind: "$stepFlowStep"},
            { "$redact": { "$cond": [{ "$eq": [ "$step", "$stepFlowStep.step" ] }, "$$KEEP", "$$PRUNE"]}},
            {$lookup: {from: "steps",localField: "step",foreignField: "_id",
            pipeline: [{$unwind: {"path": "$step","preserveNullAndEmptyArrays": true}},
            {$project:{_id: 1,name: 1,isActive: 1}}],as: "step"}},
            {"$addFields": {"step": {"$arrayElemAt": [ "$step", 0 ]}}},
            {"$sort" : { "sequence" : 1 }}
        ]

        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlowStepsHistory = await db.StepsFlowStepsHistory
            .aggregate( [
                ...filter
            ])
            
        }else {

            stepFlowStepsHistory = await db.StepsFlowStepsHistory
            .aggregate( [
                ...filter,
                { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
                { $limit: req.query.limit ? parseInt(req.query.limit) : 10 }
            ])
        }  

        return res.http200({
            stepFlowStepsHistory: stepFlowStepsHistory
        });
        
    })

    router.get('user/history/:id', async (req, res) => {

        let stepFlowStepsHistory = []

        let filter  = {}


        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        if (!req.params.id) {

            return res.http400('user id param is is required for status update.');

        }

        filter.user = req.params.id

        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlowStepsHistory = await db.StepFlowStepsHistory.find(filter)
            .populate('step','name').populate('stepFlow','name')

        }else {

            stepFlowStepsHistory = await db.StepFlowStepsHistory.find(filter)
            .populate('step','name').populate('stepFlow','name')
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            stepFlowStepsHistory: stepFlowStepsHistory
        });
        
    })


    router.get('/:id', async (req, res) => {
               
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        filter = { _id: req.params.id }

        const stepFlowStepsHistory = await db.StepFlowStepsHistory.findOne(filter)
        .populate('step','name').populate('stepFlow','name')

        if(stepFlowStepsHistory){

            req.body.updatedByUser = req.user._id
            req.body.updatedAt = new Date()
                    
            return res.http200({
                stepFlowStepsHistory: stepFlowStepsHistory
            });

        }
        
        return res.http400('stepFlowStepsHistory not found');

        
    })

}