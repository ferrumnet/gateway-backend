const { db, } = global
var mongoose = require('mongoose');

module.exports = function (router) {

    router.post('/create', async (req, res) => {

        if (!req.body.name || !req.body.stepJson) {
            return res.http400('name & stepJson are required.');
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

        let steps = []

        if (req.query.isPagination != null && req.query.isPagination == 'false') {

            steps = await db.Steps.find()

        }else {

            steps = await db.Steps.find()
            .skip(req.query.offset ? parseInt(req.query.offset) : 0)
            .limit(req.query.limit ? parseInt(req.query.limit) : 10)

        }  

        return res.http200({
            steps: steps
        });

    })

    router.put('/update/:id', async (req, res) => {

        let filter = {}
        filter = { _id: req.params.id }

        if (!req.body.name && !req.body.stepJson) {
            return res.http400('name or stepJson option is required.');
        }

        req.body.updatedBy = req.user._id

        if(req.body.name){
            req.body.nameInLower = (req.body.name).toLowerCase()
        }

        req.body.updatedAt = new Date()

       
        const step = await db.Steps.findOneAndUpdate(filter, req.body, { new: true });
           
        return res.http200({
            step: step
        });
    })

    router.put('/update/status/:id', async (req, res) => {

        let filter = {}

        filter = { _id: req.params.id }

        if (!(req.body.isActive.toString())) {
            return res.http400('isActive option is required.');
        }

        req.body.updatedBy = req.user._id

        req.body.updatedAt = new Date()

        const step = await db.Steps.findOneAndUpdate(filter, req.body, { new: true });
           
        return res.http200({
            step: step
        });
    })
}