
module.exports = {

  startHelperInit(process: any) {

    // deafult environmentTag: dev and environmentType: api
    let starterObject = {
      environmentTag : 'dev',
      isCronEnvironmentSupportedForFindTokenHolders: 'no',
      isCronIntance: 'no',
      isCronEnvironmentSupportedForCompetitionTransactionsSnapshot : 'no',
      isCronEnvironmentSupportedForCrucibleApr: 'no',
      isCronEnvironmentSupportedForMultiTokenStakingLeaderboardJob: 'no',
      isCronEnvironmentSupportedForStakingLeaderboardCurreniesUSDJob: 'no'
    }
    if(process && process.argv && process.argv.length > 0){
      console.log(process.argv);
      let environmentTag = process.argv[2] // dev | uat | qa | staging | prod
      let environmentType = process.argv[3] // api | cron

      if(environmentTag){
        starterObject.environmentTag = environmentTag
      }
      if(environmentType){
        if(environmentType == 'cron'){
          starterObject.isCronEnvironmentSupportedForFindTokenHolders = 'yes'
          starterObject.isCronIntance = 'yes'
          starterObject.isCronEnvironmentSupportedForCompetitionTransactionsSnapshot = 'yes',
          starterObject.isCronEnvironmentSupportedForCrucibleApr = 'yes',
          starterObject.isCronEnvironmentSupportedForMultiTokenStakingLeaderboardJob = 'yes',
          starterObject.isCronEnvironmentSupportedForStakingLeaderboardCurreniesUSDJob = 'yes'
        }
      }

    }

    return starterObject
  }
}
