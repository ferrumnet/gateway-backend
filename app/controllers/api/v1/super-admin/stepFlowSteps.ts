var mongoose = require('mongoose');

module.exports = function (router: any) {

    router.put('/update/:id', async (req: any, res: any) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!req.body.name && !req.body.step && !req.body.stepsFlow && !req.body.stepsRenderingJson && !req.body.orderIndex.toString()) {

            return res.http400('name ,step ,stepsFlow ,stepsRenderingJson or orderIndex required in request.');

        }

        if(req.body.step){

            const step = await db.Steps.findOne({_id: mongoose.Types.ObjectId(req.body.step)})

            if(!step){

                return res.http400('Invalid step field provided');

            }
        }

        if(req.body.stepsFlow){

            const stepsFlow = await db.StepsFlow.findOne({_id: mongoose.Types.ObjectId(req.body.stepsFlow)})

            if(!stepsFlow){

                return res.http400('Invalid stepsFlow field provided');

            }


        }


        if(req.body.name){
            req.body.nameInLower = (req.body.name).toLowerCase()
        }

        req.body.updatedAt = new Date()
        req.body.updatedBy = req.user._id

        const stepFlowStep = await db.StepFlowSteps.findOneAndUpdate(filter, req.body, { new: true });

        if (req.body.orderIndex) {

            const indexTaken =  await db.StepFlowSteps.find({stepsFlow: mongoose.Types.ObjectId(req.body.stepsFlow),orderIndex: req.body.orderIndex})

            if(indexTaken.length){

                return res.http400("The orderIndex position provided is already taken in the referred stepsFlow");

            }
        }

        return res.http200({
            stepFlowStep: stepFlowStep
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

        const stepFlowSteps = await db.StepFlowSteps.findOneAndUpdate(filter, req.body, { new: true });

        return res.http200({
            stepFlowSteps: stepFlowSteps
        });
    })


    router.get('/list', async (req: any, res: any) => {

        let stepFlowSteps: any=[]
        let filter: any = {}

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

    router.get('/:id', async (req: any, res: any) => {

        req.body.createdByUser = req.user._id

        let filter = { _id: req.params.id }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        const stepFlowStep = await db.StepFlowSteps.findOne(filter)

        if(stepFlowStep){

            return res.http200({
                stepFlowStep: stepFlowStep
            });

        }

        return res.http400('stepFlowStep not found.');

    })
}
