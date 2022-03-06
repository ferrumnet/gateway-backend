const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.get('/history/:id', async (req, res) => {

        let stepFlowStepsHistory = []

        let filter  = {}

        if (!req.params.id) {

            return res.http400('id param is is required for status update.');

        }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        filter.stepFlow = req.params.id

        filter.user = req.user._id

        if (req.query.isPagination != null && req.query.isPagination == 'false') {
            
            stepFlowStepsHistory = await db.StepFlowStepsHistory.find(filter)

        }else {

            stepFlowStepsHistory = await db.StepFlowStepsHistory.find(filter)
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            stepFlowStepsHistory: stepFlowStepsHistory
        });
        
    })
  
}