const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.post('/create', async (req, res) => {

        if (!req.body.name) {
            return res.http400('name is required in request.');
        }

        req.body.createdByUser = req.user._id

        req.body.nameInLower = (req.body.name).toLowerCase()
        req.body.createdAt = new Date()

        const step = await db.Steps.create(req.body)
           
        return res.http200({
            step: step
        });
    })

    router.get('/list', async (req, res) => {

        filter = {}

        if (req.query.name) {

            let reg = new RegExp(unescape(req.query.name), 'i');
            filter.name = reg
        }

        if(req.query.isActive){

            filter.isActive = req.query.isActive

        }
      
        let steps = []

        if (req.query.isPagination != null && req.query.isPagination == 'false') {

            steps = await db.Steps.find(filter)

        }else {

            steps = await db.Steps.find(filter)
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }
           
        return res.http200({
            steps: steps
        });
    })

    router.get('/:id', async (req, res) => {

        user = await db.Users.find({_id: req.user._id})

        var filter = { _id: req.params.id }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        step = await db.Steps.findOne(filter)

        if(step){

            return res.http200({
                step: step
            });

        }

        return res.http400('step not found , Invalid step id provided');
       
    })
}