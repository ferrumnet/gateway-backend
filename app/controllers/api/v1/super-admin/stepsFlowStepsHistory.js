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

        let filter  = {}

        if (req.query.name) {

            let reg = new RegExp(unescape(req.query.name), 'i');
            filter.name = reg
        }

        if(req.query.isActive){

            filter.isActive = req.query.isActive
            
        }

        if(req.query.status){

            filter.status = req.query.status
            
        }
    
        filter._id = req.user._id

        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlowStepsHistory = await db.StepFlowStepsHistory.find(filter)

        }else {

            stepFlowStepsHistory = await db.StepFlowStepsHistory.find(filter)
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

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

        if(req.query.stepFlow){

            filter.stepFlow = req.query.stepFlow
            
        }

        if (!req.params.id) {

            return res.http400('user id param is is required for status update.');

        }

        filter.user = req.params.id

        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlowStepsHistory = await db.StepFlowStepsHistory.find(filter)

        }else {

            stepFlowStepsHistory = await db.StepFlowStepsHistory.find(filter)
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            stepFlowStepsHistory: stepFlowStepsHistory
        });
        
    })


    router.get('/:id', async (req, res) => {
               
        req.body.createdByUser = req.user._id

        req.body.organizationId = req.user.organization

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        filter = { _id: req.params.id }

        const stepFlowStepsHistory = await db.StepFlowStepsHistory.findOne(filter)

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