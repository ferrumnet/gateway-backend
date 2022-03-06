const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.post('/create', async (req, res) => {

        console.log(req.body);
        if (!req.body.name || !req.body.step || !req.body.stepsFlow || !req.body.stepsRenderingJson || !req.body.orderIndex.toString()) {
            
            return res.http400('name ,step ,stepsFlow ,stepsRenderingJson and orderIndex is required in request.');
        
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

        req.body.organization = req.user.organization

        req.body.createdByUser = req.user._id

        req.body.nameInLower = (req.body.name).toLowerCase()

        req.body.createdAt = new Date()

        const stepFlowStep = await db.StepFlowSteps.create(req.body)
           
        return res.http200({
            stepFlowStep: stepFlowStep
        });
    })

    router.put('/update/status/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!(req.body.isActive).toString()) {

            return res.http400('isActive option is required for status update.');

        }

        const StepFlowStep = await db.StepFlowSteps.findOne(filter);

        if(StepFlowStep){

            if(req.user.organization.toString() === StepFlowStep.organization.toString()){

                req.body.updatedByUser = req.user._id
                req.body.updatedAt = new Date()
            
                const stepFlow = await db.StepFlowSteps.findOneAndUpdate(filter, req.body, { new: true });
                
                return res.http200({
                    stepFlow: stepFlow
                });
            }

            return res.http400('Not permitted to carry out operation on this item');

        }
        
        return res.http400('stepflow not found');

    })


    router.get('/list', async (req, res) => {

        stepFlowSteps=[]

        filter  = {}

        if (req.query.name) {

            let reg = new RegExp(unescape(req.query.name), 'i');
            filter.name = reg
        }

        if(req.query.isActive){

            filter.isActive = req.query.isActive
            
        }

        filter.organization = req.user.organization
    
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

        req.body.organizationId = req.user.organization

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        filter = { _id: req.params.id,organization: req.user.organization }

        const stepFlowStep = await db.StepFlowSteps.findOne(filter)

        return res.http200({
            stepFlowStep: stepFlowStep
        });
        
    })

}