
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var path = require('path');
var ejs = require("ejs");

module.exports = function (router) {

  router.get('/', async (req, res) => {

    var filter = {}
    let count = 0

    if(req.query.search){
      filter.siteName = (req.query.search).toLowerCase()
      count = await db.Organizations.count(filter)
    }

    return res.http200({
      count: count
    });

  });

  router.get('/:id', async (req, res) => {

    let filter = {}
    filter._id = req.params.id
    filter.isActive = true

    let organization = await db.Organizations.findOne(filter)

    if(organization){
      return res.http200({
        organization: organization
      });
    }
    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNotFoundOrganization),stringHelper.strErrorNotFoundOrganization,);
  });

  router.get('/:id/leaderboards', async (req, res) => {

    let userFilter = {}
    let leaderboardFilter = {isPublished: true, status: 'approved'}
    let leaderboards = []
    let sort = { createdAt: -1 }

    userFilter.isActive = true
    userFilter.organization = req.params.id

    if(req.query.isActive){
      leaderboardFilter.isActive = req.query.isActive
    }

    let userIds = await getUserIds(userFilter)

    leaderboardFilter.user = {$in: userIds}

    if(req.query.isPagination != null && req.query.isPagination == 'false'){

      leaderboards = await db.Leaderboards.find(leaderboardFilter)
      .sort(sort)

    }else {
      leaderboards = await db.Leaderboards.find(leaderboardFilter)
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }

    return res.http200({
      leaderboards: leaderboards
    });

  });

  router.get('/:id/competitions', async (req, res) => {

    let userFilter = {}
    let competitionFilter = {}
    let competitions = []
    let sort = { createdAt: -1 }

    userFilter.isActive = true
    userFilter.organization = req.params.id

    if(req.query.isActive){
      competitionFilter.isActive = req.query.isActive
    }

    competitionFilter.$or = [
      {status: {$eq: 'published'} },
      {status: {$eq: 'started'} },
    ]

    let userIds = await getUserIds(userFilter)

    competitionFilter.user = {$in: userIds}

    if(req.query.isPagination != null && req.query.isPagination == 'false'){

      competitions = await db.Competitions.find(competitionFilter)
      .sort(sort)

    }else {
      competitions = await db.Competitions.find(competitionFilter)
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }

    return res.http200({
      competitions: competitions
    });

  });

  async function getUserIds(userFilter){
    return await db.Users.find(userFilter).distinct('_id')
  }

};
