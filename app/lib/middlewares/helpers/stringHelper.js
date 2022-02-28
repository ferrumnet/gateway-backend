
var moment = require('moment');

// error messages
let strErrorInvalidCredentials = 'Backend_Error_Invalid_Credentials'
var strErrorSiteNameAlreadyExists = "Backend_Error_SiteName_Already_Exists"
let strErrorEmailIdAlreadyExists = 'Backend_Error_Email_Id_Already_Exists'
let strErrorCreateCompetitionsLimit = 'Backend_Error_Create_Competitions_Limit'
let strErrorCurrencyShouldAssociateWithAtleastOneNetwork = 'Backend_Error_Currency_Should_Associate_With_Atleast_One_Network'
let strErrorCurrencyAddressesByNetworkMustContainValue = 'Backend_Error_Currency_AddressesByNetwork_Must_Contain_Values'
let strErrorLeaderboardCreateLimit = 'Backend_Error_Leaderboard_Create_Limit'
var strErrorChangeFerrumNetworkIdentifier = "Backend_Error_Change_FerrumNetworkIdentifier"
var strErrorSignatureVerificationFailed = "Baakend_Error_Signature_Verification_Failed"
let strErrorApiKeyIsInvalid = 'Backend_Error_Api_Key_Is_Invalid'
let strErrorDEXShouldAssociateWithAtleastOneNetwork = 'Backend_Error_DEX_Should_Associate_With_Atleast_One_Network'
let strErrorTheCompetitionIDIsIncorrectOrNotAvailable = 'Backend_Error_The_competition_ID_Is_Incorrect_Or_Not_Available'
let strErrorTheLeaderboardIDIsIncorrectOrNotAvailable = 'Backend_Error_The_Leaderboard_ID_Is_Incorrect_Or_Not_Available'
let strErrorNotFoundOrganization = 'Backend_Error_Not_Found_Organization'
var strErrorLinkMessage = "Backend_Error_Link_Message"
let strErrorInvalidOtp = 'Backend_Error_Invalid_Otp'
let strErrorUserNotFound = 'Backend_Error_User_Not_Found'
let strErrorUserNameAlreadyExists = 'Backend_Error_UserName_Already_Exists'
var strErrorContractTokenAddressIsRequired = "Backend_Error_Contract_Token_Address_Is_Required"
var strErrorUniqueContractTokenAddress = "Backend_Error_Unique_Contract_Token_Address"
var strErrorFerrumNetworkIdentifierAlreadyExists = "Backend_Error_Ferrum_Network_Identifier_Already_Exists"
var strErrorUniqueXContractTokenAddress = "Backend_Error_Unique_X_ContractTokenAddress"
var strErrorNetwrokNotFound = "Backend_Error_Network_Not_Found"
var strErrorWrongAddressOrFerrumNetworkIdentifier = "Backend_Error_Wrong_Address_Or_FerrumNetworkIdentifier"
var strErrorTheRaisePoolIDIsIncorrectOrNotAvailable = "Backend_Error_The_RaisePool_ID_Is_Incorrect"
var strErrorProductNotFound = "Backend_Error_Product_Not_Found"
let strErrorUniqueEmailRequired = 'Backend_Error_Unique_Email_Required'
var strErrorActiveProductRequired = "Backend_Error_Active_Product_Required"
var strErrorPackageNotFound = "Backend_Error_Package_Not_Found"

// success messages
let strSuccessResetPasswordLink = 'Backend_Success_Reset_Password_Link'
let strSuccessOtp = 'Backend_Success_Otp'
let strSuccessContractTokenAddressIsunique = 'Backend_Success_ContractToken_Address_Is_Unique'

let strSuccess = 'Success'

//tag strings
let tagStartBlock = 'startBlock'
let tagEndBlock = 'endBlock'

module.exports = {
  strErrorNotFoundOrganization,
  strSuccessOtp,
  strErrorInvalidCredentials,
  strErrorEmailIdAlreadyExists,
  strErrorUserNotFound,
  strErrorInvalidOtp,
  strSuccessResetPasswordLink,
  strErrorLinkMessage,
  strErrorUniqueContractTokenAddress,
  strErrorContractTokenAddressIsRequired,
  strSuccessContractTokenAddressIsunique,
  strErrorUniqueXContractTokenAddress,
  strSuccess,
  strErrorUserNameAlreadyExists,
  strErrorApiKeyIsInvalid,
  strErrorFerrumNetworkIdentifierAlreadyExists,
  strErrorChangeFerrumNetworkIdentifier,
  strErrorSignatureVerificationFailed,
  strErrorSiteNameAlreadyExists,
  strErrorCreateCompetitionsLimit,
  strErrorCurrencyShouldAssociateWithAtleastOneNetwork,
  strErrorCurrencyAddressesByNetworkMustContainValue,
  strErrorLeaderboardCreateLimit,
  strErrorDEXShouldAssociateWithAtleastOneNetwork,
  strErrorTheCompetitionIDIsIncorrectOrNotAvailable,
  strErrorTheLeaderboardIDIsIncorrectOrNotAvailable,
  tagStartBlock,
  tagEndBlock,
  strErrorNetwrokNotFound,
  strErrorWrongAddressOrFerrumNetworkIdentifier,
  strErrorTheRaisePoolIDIsIncorrectOrNotAvailable,
  strErrorProductNotFound,
  strErrorUniqueEmailRequired,
  strErrorActiveProductRequired,
  strErrorPackageNotFound
}

