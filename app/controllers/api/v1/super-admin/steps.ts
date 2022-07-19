module.exports = function (router: any) {

    router.post('/create', async (req: any, res: any) => {

        if (!req.body.name) {
            return res.http400('name is required in request.');
        }

        req.body.createdByUser = req.user._id

        req.body.nameInLower = (req.body.name).toLowerCase()
        req.body.createdAt,req.body.updatedAt = new Date()

        const step = await db.Steps.create(req.body)
           
        return res.http200({
            step: step
        });
    })

    router.get('/list', async (req: any, res: any) => {

        let steps = []
        let filter: any = {}

        if (req.query.name) {

            let reg = new RegExp(unescape(req.query.name), 'i');
            filter.name = reg
        }

        if(req.query.isActive){

            filter.isActive = req.query.isActive
            
        }

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

    router.put('/update/:id', async (req: any, res: any) => {

        let filter = {}
        filter = { _id: req.params.id }

        if (!req.body.name) {
            return res.http400('name option is required for update.');
        }

        if(req.body.name){
            req.body.nameInLower = (req.body.name).toLowerCase()
        }

        req.body.updatedAt = new Date()
        req.body.updatedBy = req.user._id
       
        const step = await db.Steps.findOneAndUpdate(filter, req.body, { new: true });
           
        return res.http200({
            step: step
        });
    })

    router.put('/update/status/:id', async (req: any, res: any) => {

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

    router.get('/:id', async (req: any, res: any) => {
               
        req.body.createdByUser = req.user._id
        let filter: any = {}

        filter = { _id: req.params.id }

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.http400('Invalid id provided');
        }

        const step = await db.Steps.findOne(filter)

        if(step){

            return res.http200({
                step: step
            });

        }
        
        return res.http400('stepFlowStep not found.');
        
    })
}