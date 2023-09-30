var mongoose = require('mongoose');

module.exports = function (router: any) {

    router.put('/update/:id', async (req: any, res: any) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!req.body.name && !req.body.productId && !req.body.organization && !req.body.stepFlowSteps) {

            return res.http400('name, productId, stepFlowSteps or organization option is required for update.');

        }

        if(req.body.productId){

            const product = await db.products.findById(req.body.productId);

            if(!product){
                return res.http400('invalid product detail provided.');
            }

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

    router.put('/update/status/:id', async (req: any, res: any) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!req.body.isActive.toString()) {

            return res.http400('isActive option is required for status update.');

        }

        req.body.updatedByUser = req.user._id
        req.body.updatedAt = new Date()

        const stepFlow = await db.StepsFlow.findOneAndUpdate(filter, req.body, { new: true });

        return res.http200({
            stepFlow: stepFlow
        });
    })


    router.get('/list', async (req: any, res: any) => {

        let stepFlows=[]
        let filter: any = {}

        if (req.query.name) {

            let reg = new RegExp(unescape(req.query.name), 'i');
            filter.name = reg
        }

        if(req.query.isActive){

            filter.isActive = req.query.isActive

        }

        if (req.query.isPagination != null && req.query.isPagination == 'false') {

            stepFlows = await db.StepsFlow.find().populate('stepFlowSteps')

        }else {

            stepFlows = await db.StepsFlow.find()
            .populate('stepFlowSteps')
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }

        return res.http200({
            stepFlows: stepFlows
        });

    })

    router.get('/:id', async (req: any, res: any) => {

        let filter: any = {}

        req.body.createdByUser = req.user._id

        req.body.organizationId = req.user.organization

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        filter = { _id: req.params.id }

        const stepFlow = await db.StepsFlow.findOne(filter).populate('stepFlowSteps')

        return res.http200({
            stepFlow: stepFlow
        });

    })
}
