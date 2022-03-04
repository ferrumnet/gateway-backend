const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.post('/create', async (req, res) => {

        req.body.user = req.user._id;

        if (!req.body.stepFlow || !req.body.step) {
            
            return res.http400('step and stepsFlow is required in request.');
        
        }       

        if(!mongoose.Types.ObjectId.isValid(req.body.step) || !mongoose.Types.ObjectId.isValid(req.body.stepsFlow) ){
            return res.http400('Invalid step or stepsFlow provided');
        }

        const step = await db.Steps.findById(mongoose.Types.ObjectId(req.body.step))
        const stepsFlow =  await db.StepsFlow.findById(mongoose.Types.ObjectId(req.body.stepsFlow))

        if(!step){
            return res.http400('Invalid step field provided');
        }

        if(!stepsFlow){

            return res.http400('Invalid stepsFlow field provided');

        }

        req.body.createdByUser = req.user._id

        req.body.createdAt = new Date()

        const stepFlowStep = await db.StepFlowStepsHistory.create(req.body)
           
        return res.http200({
            stepFlowStep: stepFlowStep
        });
    })

    router.put('/update/status/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id,user: req.user._id }

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

    router.get('/stepFlow/history/:id', async (req, res) => {

        let stepFlowStepsHistory = []

        let filter  = {}

        if (!req.params.id) {

            return res.http400('id param is is required for status update.');

        }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        filter.stepFlow = req.params.id

        filter.user = req.user._id

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

            if(req.user._id.toString() === stepFlowStepsHistory.user._id.toString()){

                req.body.updatedByUser = req.user._id
                req.body.updatedAt = new Date()
                            
                return res.http200({
                    stepFlowStepsHistory: stepFlowStepsHistory
                });
            }

            return res.http400('Not permitted to carry out operation on this item');

        }
        
        return res.http400('stepFlowStepsHistory not found');

        
    })

}