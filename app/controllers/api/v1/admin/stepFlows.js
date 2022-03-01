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

        if(req.body.orderIndex && req.body.orderIndex.length > 0){

            for(let stepIndex of req.body.orderIndex){

                step = await db.Steps.findOne({_id: stepIndex})

                if(!step.length){
                    return res.http400('Invalid Step flow entered in orderIndex');
                }

            }
        }

        const stepFlow = await db.StepFlow.create(req.body)
           
        return res.http200({
            stepFlow: stepFlow
        });
    })

    router.get('/:id', async (req, res) => {
               
        req.body.organization = req.user.organization

        filter = { _id: req.params.id, organization: req.user.organization }

        const stepFlow = await db.StepFlow.findOne(filter)

        return res.http200({
            stepFlow: stepFlow
        });
        
    })

    router.get('/list', async (req, res) => {

        req.body.organization = req.user.organization

        let stepFlows = []
        
        filter = {organization : req.body.organization }
        
        if (req.query.isPagination != null && req.query.isPagination == 'false') {

            stepFlows = await db.StepFlow.find(filter)

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

  
}