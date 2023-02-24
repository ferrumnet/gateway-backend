const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.post('/create', async (req, res) => {

        if (!req.body.name || !req.body.productId) {

            return res.http400('name & productId are required.');

        }

        req.body.createdByUser = req.user._id

        req.body.organization = req.user.organization

        req.body.nameInLower = (req.body.name).toLowerCase()

        req.body.createdAt,req.body.updatedAt = new Date()

        if(req.body.productId){

            const product = await db.Products.findById(req.body.productId);

            if(!product){
                return res.http400('invalid product detail provided.');
            }

        }

        if(req.body.stepFlowSteps){

            for (stepFlowStepId of req.body.stepFlowSteps){

                if(!mongoose.Types.ObjectId.isValid(stepFlowStepId)){
                    return res.http400('Invalid stepflowstep id provided');
                }

                const StepFlowStep = await db.StepFlowSteps.findById(stepFlowStepId);

                if(!StepFlowStep){
                    return res.http400('stepflowstep item provided not found');
                }

            }

        }

        const stepFlow = await db.StepsFlow.create(req.body)
           
        return res.http200({
            stepFlow: stepFlow
        });

    })

 
    router.get('/list', async (req, res) => {

        req.body.organization = req.user.organization

        let stepFlows = []
        
        filter = {organization : req.user.organization }

        if (req.query.name) {

            let reg = new RegExp(unescape(req.query.name), 'i');
            filter.name = reg
        }

        if(req.query.isActive){

            filter.isActive = req.query.isActive
            
        }
        
        if (req.query.isPagination != null && req.query.isPagination == 'false') {

            stepFlows = await db.StepsFlow.find(filter)

        }else {
            stepFlows = await db.StepsFlow.find(filter)
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            organization:  req.user.organization,
            stepFlows: stepFlows
        });

    })

    router.put('/update/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id,organization:  req.user.organization}

        if (!req.body.name && !req.body.productId && !req.body.stepFlowSteps) {

            return res.http400('name, productId or stepFlowSteps option is required for update.');

        }

        const stepFlow = await db.StepsFlow.findOne(filter);

        if(req.body.productId){

            const product = await db.products.findById(req.body.productId);

            if(!product){
                return res.http400('invalid product detail provided.');
            }

        }

        if(stepFlow){

            if(req.body.name){
                req.body.nameInLower = (req.body.name).toLowerCase()
            }
    
            req.body.updatedAt = new Date()
            req.body.updatedBy = req.user._id

            if(req.body.stepFlowSteps){

                for (stepFlowStepId of req.body.stepFlowSteps){

                    if(!mongoose.Types.ObjectId.isValid(stepFlowStepId)){
                        return res.http400('Invalid stepflowstep id provided');
                    }

                    const StepFlowStep = await db.StepFlowSteps.findById(stepFlowStepId);

                    if(!StepFlowStep){
                        return res.http400('stepflowstep item provided not found');
                    }

                }

            }
           
            const stepFlows = await db.StepsFlow.findOneAndUpdate(filter, req.body, { new: true });
               
            return res.http200({
                stepFlow: stepFlows
            });

        }else{

            return res.http400('stepflow not found');

        }

    })


    router.get('/:id', async (req, res) => {
               
        req.body.organization = req.user.organization

        filter = { _id: req.params.id, organization: req.user.organization }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        const stepFlow = await db.StepsFlow.findOne(filter).populate('stepFlowSteps')
        
        if(stepFlow){

            return res.http200({
                stepFlow: stepFlow
            });
            
        }else{

            return res.http400('stepflow not found');

        }
       
    })

}
