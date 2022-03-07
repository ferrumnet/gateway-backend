const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.put('/update/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!req.body.name && !req.body.step && !req.body.stepsFlow && !req.body.stepsRenderingJson && !req.body.orderIndex.toString()) {

            return res.http400('name ,stepId ,stepsFlowId ,stepsRenderingJson or orderIndex required in request.');

        }

        if(!mongoose.Types.ObjectId.isValid(req.body.step) || !mongoose.Types.ObjectId.isValid(req.body.stepsFlow) ){
            return res.http400('Invalid Step or stepsFlow provided');
        }

        if(req.body.stepId){

            const step = await db.Steps.findOne({_id: req.body.stepId})

            if(!step){

                return res.http400('Invalid StepId field provided');
    
            }
        }

        if(req.body.stepsFlowId){

            const stepsFlow = await db.StepsFlow.findOne({_id: req.body.stepsFlowId})

            if(!stepsFlow){
    
                return res.http400('Invalid stepsFlowId field provided');
    
            }
        }
      

        if(req.body.name){
            req.body.nameInLower = (req.body.name).toLowerCase()
        }

        req.body.updatedAt = new Date()
        req.body.updatedBy = req.user._id
       
        const stepFlow = await db.StepFlowSteps.findOneAndUpdate(filter, req.body, { new: true });
           
        return res.http200({
            stepFlow: stepFlow
        });
    })


    router.put('/update/status/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!req.body.isActive.toString()) {

            return res.http400('isActive option is required for status update.');

        }

        req.body.updatedByUser = req.user._id
        req.body.updatedAt = new Date()
       
        const stepFlowSteps = await db.StepFlowSteps.findOneAndUpdate(filter, req.body, { new: true });
           
        return res.http200({
            stepFlowSteps: stepFlowSteps
        });
    })


    router.get('/list', async (req, res) => {

        stepFlowSteps=[]

        if (req.query.name) {

            let reg = new RegExp(unescape(req.query.name), 'i');
            filter.name = reg
        }

        if(req.query.isActive){

            filter.isActive = req.query.isActive
            
        }

        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlowSteps = await db.StepFlowSteps.find()

        }else {

            stepFlowSteps = await db.StepFlowSteps.find()
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            stepFlowSteps: stepFlowSteps
        });
        
    })

    router.get('/:id', async (req, res) => {
               
        req.body.createdByUser = req.user._id

        filter = { _id: req.params.id }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        const stepFlowStep = await db.StepFlowSteps.findOne(filter)
        .populate('step')
        .populate('stepsFlow')

        if(stepFlowStep){

            return res.http200({
                stepFlowStep: stepFlowStep
            });

        }
        
        return res.http400('stepFlowStep not found.');

    })
}