const { db,stringHelper } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.put('/update/status/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id,user: req.user._id }

        if (!(req.body.status).toString()) {

            return res.http400('status option is required for status update.');

        }

        const stepFlowStepsHistory = await db.StepsFlowStepsHistory.findOne(filter);

        if(stepFlowStepsHistory){

            req.body.updatedByUser = req.user._id
            req.body.updatedAt = new Date()
        
            const stepsFlowHistory = await db.StepsFlowStepsHistory.findOneAndUpdate(filter, req.body, { new: true });
            
            return res.http200({
                stepsFlowStepHistory: stepsFlowHistory
            });

        }
        
        return res.http400('user stepFlowStepsHistory item not found');

    })

    router.get('/list', async (req, res) => {

        let stepFlowStepsHistory = []

        let filter  = {}

        if (req.query.name) {

            let reg = new RegExp(unescape(req.query.name), 'i');
            filter.name = reg
        }

        if(req.query.isActive){

            filter.isActive = req.query.isActive
            
        }
    
        filter.user = req.user._id

        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlowStepsHistory = await db.StepsFlowStepsHistory.find(filter)

        }else {

            stepFlowStepsHistory = await db.StepsFlowStepsHistory.find(filter)
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            stepFlowStepsHistory: stepFlowStepsHistory
        });
        
    })

    router.get('/stepFlow/:id', async (req, res) => {

        let stepFlowStepsHistory = []

        let filter  = {}

        if (!req.params.id) {

            return res.http400('id param is required for status update.');

        }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        filter =  [
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
        
        if(!stepFlowStepsHistory.length){

            const StepsFlowItem =  await db.StepsFlow.findOne({_id: req.params.id })

            if(StepsFlowItem){
                
                for(StepsFlow of StepsFlowItem.stepFlowSteps){

                    stepFlowStep = await db.StepFlowSteps.findOne({_id: StepsFlow })
                    
                    if(stepFlowStep.stepsFlow.toString() === req.params.id.toString()){
                        await db.StepsFlowStepsHistory.create({
                            stepFlow: stepFlowStep.stepsFlow,
                            step: stepFlowStep.step,
                            user: req.user._id,
                            sequence: 1
                        })
                    }
                    
                }
                stepFlowStepsHistory = await db.StepsFlowStepsHistory
                .aggregate( [
                    ...filter,
                    { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
                    { $limit: req.query.limit ? parseInt(req.query.limit) : 10 }
                ])

            }
        }

        return res.http200({
            stepFlowStepsHistory: stepFlowStepsHistory
        });
        
    })

    router.get('/stepFlow/latest/:id', async (req, res) => {

        let stepFlowStepsHistory = []

        let filter  = {}

        if (!req.params.id) {

            return res.http400('id param is is required for status update.');

        }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        const lastItem = await db.StepsFlowStepsHistory.findOne().sort({_id: -1})

        if(lastItem){
            filter =  [
                {$match: {$and: [{ user: req.user._id},{ stepFlow: mongoose.Types.ObjectId(req.params.id)},{ sequence: lastItem.sequence}]}},
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

        }else{
            return res.http400('User as no stepFlowStepsHistory for specified stepflow');
        }
        

        return res.http200({
            stepFlowStepsHistory: stepFlowStepsHistory
        });
        
    })

    router.get('/restart/stepFlow/:id', async (req, res) => {

        let stepFlowStepsHistory = []

        filter =  [
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

        if (!req.params.id) {

            return res.http400('id param is is required for status update.');

        }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        filter.stepFlow = req.params.id

        filter.user = req.user._id

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
        
        if(stepFlowStepsHistory.length){
            const lastHistory = stepFlowStepsHistory[(stepFlowStepsHistory.length-1)];
            const StepsFlowItem =  await db.StepsFlow.findOne({_id: req.params.id })

            if(StepsFlowItem){
                if(lastHistory.status === 'completed'){
                    for(StepsFlow of StepsFlowItem.stepFlowSteps){

                        stepFlowStep = await db.StepFlowSteps.findOne({_id: StepsFlow })
                        
                        await db.StepsFlowStepsHistory.create({
                            stepFlow: stepFlowStep.stepsFlow,
                            step: stepFlowStep.step,
                            user: req.user._id,
                            sequence: Number(lastHistory.sequence) + 1
                        })

                    }
                }else{

                    return res.http400( await commonFunctions.getValueFromStringsPhrase(
                            stringHelper.strErrorPreviousSequenceNotCompleted
                    ))
                }
            }
            stepFlowStepsHistory = await db.StepsFlowStepsHistory
            .aggregate( [
                ...filter,
                { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
                { $limit: req.query.limit ? parseInt(req.query.limit) : 10 }
            ])
            return res.http200({
                stepFlowStepsHistory: stepFlowStepsHistory
            });
            
        }else{

            return res.http400(
                await commonFunctions.getValueFromStringsPhrase(
                    stringHelper.strNoUserStepFlowHistoryAvailable
                )
            );

        }
    })

    router.get('/:id', async (req, res) => {
               
        req.body.createdByUser = req.user._id

        req.body.organizationId = req.user.organization

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        filter = { _id: req.params.id }

        const stepFlowStepsHistory = await db.StepsFlowStepsHistory.findOne(filter)

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