import crypto from "crypto";
var CryptoJS = require("crypto-js");
import moment from "moment";

module.exports = {
    async doWithdrawSignedFromFIBER(req: any, swapAndWithdrawTransactionObject: any) {
        swapAndWithdrawTransactionObject = await db.SwapAndWithdrawTransactions.findOne({ _id: swapAndWithdrawTransactionObject._id })
            .populate('sourceNetwork').populate('destinationNetwork')
            .populate('sourceCabn').populate('destinationCabn');

        swapAndWithdrawTransactionObject.updatedAt = new Date();
        swapAndWithdrawTransactionObject.status = utils.swapAndWithdrawTransactionStatuses.swapWithdrawPending;
        await db.SwapAndWithdrawTransactions.findOneAndUpdate({ _id: swapAndWithdrawTransactionObject._id }, swapAndWithdrawTransactionObject, { new: true });

        let withdrawData = await fiberAxiosHelper.doWithdrawSigned(req, swapAndWithdrawTransactionObject);
        return swapAndWithdrawTransactionObject;
    },

    async getTokenQuoteInformationFromFIBER(req: any) {
        let tokenQuoteInformation = await fiberAxiosHelper.getTokenQuoteInformation(req);
        return tokenQuoteInformation;
    },

    async fiberAuthorizationToken() {
        let timelapse = 5;
        let currentTime = new Date();
        let startDateTime = moment(currentTime)
            .subtract("minutes", timelapse)
            .utc()
            .format();
        let endDateTime = moment(currentTime)
            .add("minutes", timelapse)
            .utc()
            .format();
        let randomKey = crypto.randomBytes(512).toString("hex");
        let apiKey = (global as any).environment.apiKeyForGateway || "";
        let tokenBody: any = {};
        tokenBody.startDateTime = startDateTime;
        tokenBody.endDateTime = endDateTime;
        tokenBody.randomKey = randomKey;
        tokenBody.apiKey = apiKey;
        let strTokenBody = JSON.stringify(tokenBody);
        let encryptedSessionToken = CryptoJS.AES.encrypt(strTokenBody, (global as any).environment.jwtSecret).toString();
        return 'Bearer ' + encryptedSessionToken;
    },
}