// error messages
let strErrorInvalidCredentials = "Backend_Error_Invalid_Credentials";
var strErrorSiteNameAlreadyExists = "Backend_Error_SiteName_Already_Exists";
let strErrorEmailIdAlreadyExists = "Backend_Error_Email_Id_Already_Exists";
let strErrorCreateCompetitionsLimit = "Backend_Error_Create_Competitions_Limit";
let strErrorCurrencyShouldAssociateWithAtleastOneNetwork =
  "Backend_Error_Currency_Should_Associate_With_Atleast_One_Network";
let strErrorCurrencyAddressesByNetworkMustContainValue =
  "Backend_Error_Currency_AddressesByNetwork_Must_Contain_Values";
let strErrorLeaderboardCreateLimit = "Backend_Error_Leaderboard_Create_Limit";
var strErrorChangeFerrumNetworkIdentifier =
  "Backend_Error_Change_FerrumNetworkIdentifier";
var strErrorSignatureVerificationFailed =
  "Baakend_Error_Signature_Verification_Failed";
let strErrorApiKeyIsInvalid = "Backend_Error_Api_Key_Is_Invalid";
let strErrorDEXShouldAssociateWithAtleastOneNetwork =
  "Backend_Error_DEX_Should_Associate_With_Atleast_One_Network";
let strErrorTheCompetitionIDIsIncorrectOrNotAvailable =
  "Backend_Error_The_competition_ID_Is_Incorrect_Or_Not_Available";
let strErrorTheLeaderboardIDIsIncorrectOrNotAvailable =
  "Backend_Error_The_Leaderboard_ID_Is_Incorrect_Or_Not_Available";
let strErrorNotFoundOrganization = "Backend_Error_Not_Found_Organization";
var strErrorLinkMessage = "Backend_Error_Link_Message";
let strErrorInvalidOtp = "Backend_Error_Invalid_Otp";
let strErrorUserNotFound = "Backend_Error_User_Not_Found";
let strErrorUserNameAlreadyExists = "Backend_Error_UserName_Already_Exists";
var strErrorContractTokenAddressIsRequired =
  "Backend_Error_Contract_Token_Address_Is_Required";
var strErrorUniqueContractTokenAddress =
  "Backend_Error_Unique_Contract_Token_Address";
var strErrorFerrumNetworkIdentifierAlreadyExists =
  "Backend_Error_Ferrum_Network_Identifier_Already_Exists";
var strErrorUniqueXContractTokenAddress =
  "Backend_Error_Unique_X_ContractTokenAddress";
var strErrorNetwrokNotFound = "Backend_Error_Network_Not_Found";
var strErrorWrongAddressOrFerrumNetworkIdentifier =
  "Backend_Error_Wrong_Address_Or_FerrumNetworkIdentifier";
var strErrorTheRaisePoolIDIsIncorrectOrNotAvailable =
  "Backend_Error_The_RaisePool_ID_Is_Incorrect";
var strErrorProductNotFound = "Backend_Error_Product_Not_Found";
let strErrorUniqueEmailRequired = "Backend_Error_Unique_Email_Required";
var strErrorActiveProductRequired = "Backend_Error_Active_Product_Required";
var strErrorAlreadyPledged = "Backend_Error_Already_Pledged";
var strErrorPackageNotFound = "Backend_Error_Package_Not_Found";
var strErrorSubscriptionNotFound = "Backend_Error_Not_Found_Subscription";
var strErrorSubscriptionAlreadyExists =
  "Backend_Error_Subscription_Already_Exists";
let strErrorPreviousSequenceNotCompleted =
  "Backend_Error_Previous_Sequence_Not_Completed";
let strNoUserStepFlowHistoryAvailable = "Backend_No_StepFlow_History_Available";
let strErrorCronNotFound = "Backend_Error_Cron_Not_Found";
let strErrorOrganizationDelete = "Backend_Error_Organization_Delete";
let strErrorNetworkDelete = "Backend_Error_Network_Delete";
let strErrorDexDelete = "Backend_Error_Dex_Delete";
let strErrorDelete = "Backend_Error_Delete";
let strAddressNotFound = "Backend_Address_Not_Found";
let strSameNetwork = "Backend_Same_Network";
let strLogsNotFound = "Backend_Logs_Not_Found";
let strErrorSmartContractShouldAssociateWithAtleastOneNetwork =
  "Backend_Error_Smart_contract_Should_Associate_With_Atleast_One_Network";
var strErrorNetworkHaveAlreadySmartContract =
  "Backend_Error_X_Network_Have_Already_SmartContract";
var strErrorApprovalIsOnPending = "Backend_Approval_Is_On_Pending";
var strErrorApprovalIsOnDeclined = "Backend_Approval_Is_On_Declined";
var strErrorAddBaseFeeToken = "Backend_Add_Base_Fee_Token";
var strErrorUpdateBaseFeeToken = "Backend_Update_Base_Fee_Token";
var strErrorBaseFeeTokenIsNotSetupForUpdateCabn =
  "Backend_Base_Fee_Token_Is_Not_Setup";
var strErrorEstimatedSwapTimeAlreadyExist =
  "Backend_Estimated_Swap_Time_Already_Exist";
var strErrorBackendNoCurrencyFoundAgainstTokenAddress =
  "Backend_No_Currency_Found_Against_Token_Address";
let strErrorApprovalIsOnApproved = "Backend_Approval_Is_Approved";
let transactionFailedMessageOne = "Backend_Transaction_Failed_Message_One";
let transactionFailedMessageTwo = "Backend_Transaction_Failed_Message_Two";
let invalidHashMessage = "Backend_Invalid_Hash_Message";
let swapFailedMessage = "Backend_Swap_Failed_Message";
var strErrorCabnAlreadyExist = "Backend_Error_Cabn_Already_Exist";
var strErrorNodePairAlreadyExist = "This pair already exist.";
var strErrorNoRandmonKeyAvailable = "No randmon key available";

// success messages
let strSuccessResetPasswordLink = "Backend_Success_Reset_Password_Link";
let strSuccessOtp = "Backend_Success_Otp";
let strSuccessContractTokenAddressIsunique =
  "Backend_Success_ContractToken_Address_Is_Unique";
let strSuccessOrganizationMemberSignUpCompleted =
  "Backend_Organization_Member_SignUp_Completed";
let withdrawlSuccessfulMessage = "Backend_Withdrawl_Successful_Message";

let strSuccess = "Success";

//tag strings
let tagStartBlock = "startBlock";
let tagEndBlock = "endBlock";

// validation messages
let chainIdNotSupported = "ChainId not supported.";

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
  strErrorPackageNotFound,
  strErrorAlreadyPledged,
  strErrorSubscriptionNotFound,
  strErrorSubscriptionAlreadyExists,
  strErrorPreviousSequenceNotCompleted,
  strNoUserStepFlowHistoryAvailable,
  strErrorCronNotFound,
  strErrorOrganizationDelete,
  strErrorNetworkDelete,
  strErrorDexDelete,
  strErrorDelete,
  strAddressNotFound,
  strSameNetwork,
  strLogsNotFound,
  strErrorSmartContractShouldAssociateWithAtleastOneNetwork,
  strErrorNetworkHaveAlreadySmartContract,
  strSuccessOrganizationMemberSignUpCompleted,
  strErrorApprovalIsOnPending,
  strErrorApprovalIsOnDeclined,
  strErrorApprovalIsOnApproved,
  strErrorAddBaseFeeToken,
  strErrorUpdateBaseFeeToken,
  strErrorBaseFeeTokenIsNotSetupForUpdateCabn,
  strErrorEstimatedSwapTimeAlreadyExist,
  strErrorBackendNoCurrencyFoundAgainstTokenAddress,
  transactionFailedMessageOne,
  transactionFailedMessageTwo,
  invalidHashMessage,
  swapFailedMessage,
  withdrawlSuccessfulMessage,
  strErrorNodePairAlreadyExist,
  chainIdNotSupported,
  strErrorCabnAlreadyExist,
  strErrorNoRandmonKeyAvailable,
};
