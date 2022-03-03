const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.put('/update/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!req.body.name && !req.body.productId && !req.body.organization && !req.body.stepFlowSteps) {

            return res.http400('name, productId, stepFlowSteps or organization option is required for update.');

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
    })

    router.put('/update/status/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!req.body.isActive) {

            return res.http400('isActive option is required for status update.');

        }

        req.body.updatedByUser = req.user._id
        req.body.updatedAt = new Date()
       
        const stepFlow = await db.StepsFlow.findOneAndUpdate(filter, req.body, { new: true });
           
        return res.http200({
            stepFlow: stepFlow
        });
    })

    router.get('/:id', async (req, res) => {
               
        req.body.createdByUser = req.user._id

        req.body.organizationId = req.user.organization

        filter = { _id: req.params.id }

        const stepFlow = await db.StepsFlow.findOne(filter)

        return res.http200({
            stepFlow: stepFlow
        });
        
    })

    router.get('/list', async (req, res) => {

        stepFlows=[]

        if (req.query.name) {

            let reg = new RegExp(unescape(req.query.name), 'i');
            filter.name = reg
        }

        if(req.query.isActive){

            filter.isActive = req.query.isActive
            
        }
    
        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlows = await db.StepsFlow.find()

        }else {

            stepFlows = await db.StepsFlow.find()
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            stepFlows: stepsFlow
        });
        
    })
}