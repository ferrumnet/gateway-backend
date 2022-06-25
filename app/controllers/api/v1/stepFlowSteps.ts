var mongoose = require('mongoose');

module.exports = function (router: any) {

    router.get('/:id', async (req: any, res: any) => {
     
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        let filter = { stepsFlow: req.params.id }

        const stepFlow = await db.StepFlowSteps.find(filter)
        .populate('step','name')
        .sort({'orderIndex': 1})
        
        return res.http200({
            stepsFlowStep: stepFlow
        });
        
    })

}