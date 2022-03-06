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
        
            const stepFlow = await db.StepFlowStepsHistory.findOneAndUpdate(filter, req.body, { new: true });
            
            return res.http200({
                stepFlow: stepFlow
            });

        }
        
        return res.http400('user stepFlowStepsHistory not found');

    })


    router.get('/list', async (req, res) => {

        let stepFlowStepsHistory = []

        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlowStepsHistory = await db.StepsFlowStepsHistory
            .aggregate( [
                {
                   $lookup:
                      {
                        from: "stepFlowSteps",
                        localField: "stepFlow",
                        foreignField: "stepsFlow",
                        pipeline: [
                            {    
                              $unwind: { 
                                  "path": "$stepFlowSteps","preserveNullAndEmptyArrays": true}
                            }
                        ],
                        as: "stepFlowStep"
                      }
                },
                {
                    $lookup:
                       {
                         from: "stepFlowSteps",
                         localField: "step",
                         foreignField: "step",
                         pipeline: [
                             {    
                               $unwind: { 
                                   "path": "$stepFlowSteps","preserveNullAndEmptyArrays": true}
                             }
                         ],
                         as: "stepFlowStep"
                       }
                }
            ])
            
        }else {

            stepFlowStepsHistory = await db.StepsFlowStepsHistory
            .aggregate( [
                {
                   $lookup:
                      {
                        from: "stepFlowSteps",
                        localField: "stepFlow",
                        foreignField: "stepsFlow",
                        pipeline: [
                            {    
                              $unwind: { 
                                  "path": "$stepFlowSteps","preserveNullAndEmptyArrays": true}
                            },
                            {$project:{
                                stepFlowSteps:'$stepFlowSteps.name',
                                stepsRenderingJson: 1, 
                                orderIndex: 1, 
                                name: 1,
                                status: 1,
                                isActive: 1
                           }}
                        ],
                        as: "stepFlowStep"
                      }
                },
                {
                    $lookup:
                       {
                         from: "stepFlowSteps",
                         localField: "step",
                         foreignField: "step",
                         pipeline: [
                             {    
                               $unwind: { 
                                   "path": "$stepFlowSteps","preserveNullAndEmptyArrays": true}
                             },
                             {$project:{
                                 stepFlowSteps:'$stepFlowSteps.name',
                                 stepsRenderingJson: 1, 
                                 orderIndex: 1, 
                                 name: 1,
                                 status: 1,
                                 isActive: 1
                            }}
                         ],
                         as: "stepFlowStep"
                       }
                },
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