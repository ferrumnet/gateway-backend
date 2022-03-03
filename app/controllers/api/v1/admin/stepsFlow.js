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

        req.body.createdAt = new Date()

        const stepFlow = await db.StepsFlow.create(req.body)
           
        return res.http200({
            stepFlow: stepFlow
        });

    })

    router.get('/:id', async (req, res) => {
               
        req.body.organization = req.user.organization

        filter = { _id: req.params.id, organization: req.user.organization }

        const stepFlow = await db.StepsFlow.findOne(filter)

        return res.http200({
            stepFlow: stepFlow
        });
        
    })

    router.get('/list', async (req, res) => {

        req.body.organization = req.user.organization

        let stepFlows = []
        
        filter = {organization : req.body.organization }

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

            steps = await db.Steps.find(filter)
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            organization:  user[0].organization,
            stepFlows: stepFlows
        });

    })

    router.put('/update/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!req.body.name && !req.body.productId && !req.body.stepFlowSteps) {

            return res.http400('name, productId or stepFlowSteps option is required for update.');

        }

        const stepFlow = await db.StepsFlow.findOne(filter);

        if(stepFlow){

            if(req.user.organization != stepFlow[0].organization){
                return res.http400('Not permitted to carry out operation on this item');
            }

            if(req.body.name){
                req.body.nameInLower = (req.body.name).toLowerCase()
            }
    
            req.body.updatedAt = new Date()
            req.body.updatedBy = req.user._id
           
            const stepFlow = await db.StepsFlow.findOneAndUpdate(filter, req.body, { new: true });
               
            return res.http200({
                stepFlow: stepFlow
            });

        }else{

            return res.http400('stepflow not found');

        }

    })


  
}