const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {


    router.get('/list', async (req, res) => {

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

        step = await db.Steps.findOne(filter)

        if(step){

            return res.http200({
                step: step
            });

        }

        return res.http400('step not found , Invalid step id provided');
       
    })
}