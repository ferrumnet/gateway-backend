const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');

module.exports = function (router) {

  router.post('/sign-up', async (req, res) => {

    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
      return res.http400('firstName & lastName & & email & password are required.');
    }

    let emailCount = await db.Users.count({ email: req.body.email });

    if (emailCount > 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorEmailIdAlreadyExists),stringHelper.strErrorEmailIdAlreadyExists,);
    }

    if (req.body.firstName) {
      req.body.firstNameInLower = req.body.firstName.toLowerCase()
    }

    if (req.body.lastName) {
      req.body.lastNameInLower = req.body.lastName.toLowerCase()
    }

    req.body.name = req.body.firstName + " " + req.body.lastName
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.role = 'superAdmin'
    req.body.createdAt = new Date()


    if (req.body.password) {
      req.body.password = db.Users.getHashedPassword(req.body.password);
    }

    let user;
    try {
      user = await db.Users.create(req.body)
    } catch (err) {
      return res.http400(err.message);
    }

    res.http200({
      user: user.toClientObject(),
      token: user.createAPIToken(user)
    });

  });

  router.post('/sign-in', async (req, res) => {
    var filter = {}
    if (!req.body.email || !req.body.password) {
      return res.http400('Email & password is required.');
    }

    filter.role = 'superAdmin'

    filter.email = req.body.email
    //filter.password = req.body.password

    let user = await db.Users.findOne(filter);

    if (user) {

      res.http200({
        user: user.toClientObject(),
        token: user.createAPIToken(user)
      });

    } else {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorInvalidCredentials),stringHelper.strErrorInvalidCredentials,);
    }
  });

  router.get('/profile/me', async (req, res) => {

    let filter = {}
    filter = { _id: req.user._id }

    let user = await db.Users.findOne(filter)
    res.http200({
      user: user.toClientObject()
    });

  });

  router.put('/update/active/inactive/:id', async (req, res) => {

    if (req.body.isActive == null) {
      return res.http400('isActive is required.');
    }

    let user = await db.Users.findOneAndUpdate({ _id: req.params.id }, { isActive: req.body.isActive }, { new: true })

    if (user) {
      return res.http200({
        user: user.toClientObject()
      });
    } else {
      return res.http400(global.stringHelper.strErrorUserNotFound);
    }

  });

  router.post('/create/application-user', async (req, res) => {

    if (!req.body.email || !req.body.userName) {
      return res.http400('email & userName are required.');
    }

    let emailCount = await db.Users.count({ email: req.body.email });

    if (emailCount > 0) {
      return res.http400(stringHelper.strErrorEmailIdAlreadyExists);
    }

    let userNameCount = await db.Users.count({ userName: req.body.userName });

    if (userNameCount > 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorUserNameAlreadyExists),stringHelper.strErrorUserNameAlreadyExists,);
    }

    req.body.apiKey = uuidv4()
    req.body.role = 'applicationUser'
    req.body.createdBy = req.user._id
    req.body.isActive = true
    req.body.isActive = true
    req.body.isEmailAuthenticated = true
    req.body.createdAt = new Date()

    try {
      let user = await db.Users.create(req.body)
      return res.http200({
        user: user.toClientObject(),
        token: user.createAPIToken(user)
      });
    } catch (err) {
      return res.http400(err.message);
    }

  });

  router.get('/profile/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    try {
      let user = await db.Users.findOne(filter)
      return res.http200({
        user: user.toClientObject()
      });
    } catch (err) {
      return res.http400(err.message);
    }

  });

  router.get('/list', async (req, res) => {

    var matchFilter = {}
    var filterOrList= []
    var filterAndList= []
    var filter = []
    let sort = { createdAt: -1 }
    let users = []


    if(req.query.name){
      let reg = new RegExp(unescape(req.query.name), 'i');
      filterAndList.push({nameInLower: reg})
    }

    if(req.query.email) {
      if(req.query.email.includes(' ')){
        req.query.email = req.query.email .replace(' ', '+')
      }
      console.log(req.query.email)
      filterAndList.push({email: req.query.email})
    }


    if(req.query.role) {
      filterAndList.push({role: req.query.role})
    }

    if(req.query.isEmailAuthenticated) {
      let isBoolean = false
      if(req.query.isEmailAuthenticated == 'true'){
        isBoolean = true
      }
      filterAndList.push({isEmailAuthenticated: isBoolean})
    }

    if(req.query.address) {
      req.query.address = (req.query.address).toLowerCase()
      filterAndList.push({'addresses.address': req.query.address})
    }

    if(req.query.isAddressAuthenticated) {
      let isBoolean = false
      if(req.query.isAddressAuthenticated == 'true'){
        isBoolean = true
      }
      filterAndList.push({'addresses.status.isAddressAuthenticated': isBoolean})
    }

    if(filterOrList && filterOrList.length > 0){
      matchFilter.$or = []
      matchFilter.$or.push({$or: filterOrList})
    }

    if(filterAndList && filterAndList.length > 0){
      matchFilter.$and = []
      matchFilter.$and.push({$and: filterAndList})
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      filter = [
        { $lookup: { from: 'addresses', localField: 'addresses', foreignField: '_id', as: 'addresses' } },
        { $unwind: { "path": "$addresses","preserveNullAndEmptyArrays": true}},
        { $match: matchFilter },
        { $sort: sort }
      ];

    } else {

      filter = [
        { $lookup: { from: 'addresses', localField: 'addresses', foreignField: '_id', as: 'addresses' } },
        { $unwind: { "path": "$addresses","preserveNullAndEmptyArrays": true}},
        { $unset: [ "password", "emailVerificationCode", "forgotPasswordAuthenticationToken", "emailVerificationCodeGenratedAt" ]},
        { $match: matchFilter },
        { $sort: sort },
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];

    }

    users = await db.Users.aggregate(filter);

    return res.http200({
      users: users
    });

  });

};
