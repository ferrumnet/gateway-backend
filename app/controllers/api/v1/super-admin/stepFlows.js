const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {


    router.put('/update/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!req.body.name && !req.body.productId && !req.body.organization && !req.body.orderIndex) {

            return res.http400('name,productId,organization or orderIndex option is required for update.');

        }

        req.body.updatedBy = req.user._id

        if(req.body.name){
            req.body.nameInLower = (req.body.name).toLowerCase()
        }

        req.body.updatedAt = new Date()

       
        const stepFlow = await db.StepFlow.findOneAndUpdate(filter, req.body, { new: true });
           
        return res.http200({
            stepFlow: stepFlow
        });
    })

    router.put('/update/status/:id', async (req, res) => {

        let filter = {}
        filter = { _id: req.params.id }

        if (!req.body.isActive && !req.body.status) {
            return res.http400('isActive or status option is required for update.');
        }

        req.body.updatedByUser = req.user._id

        req.body.updatedAt = new Date()
       
        const stepFlow = await db.StepFlow.findOneAndUpdate(filter, req.body, { new: true });
           
        return res.http200({
            stepFlow: stepFlow
        });
    })

    router.get('/:id', async (req, res) => {
               
        req.body.createdByUser = req.user._id

        req.body.organizationId = req.user.organization

        filter = { _id: req.params.id }

        const stepFlow = await db.StepFlow.findOne(filter)

        return res.http200({
            stepFlow: stepFlow
        });
        
    })

    router.get('/list', async (req, res) => {

        stepFlows=[]
    
        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlows = await db.StepFlow.find()

        }else {

            stepFlows = await db.StepFlow.find()
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            stepFlows: stepFlows
        });
        
    })
}