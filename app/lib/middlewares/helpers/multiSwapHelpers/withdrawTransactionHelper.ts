import crypto from "crypto";
var CryptoJS = require("crypto-js");
import moment from "moment";

module.exports = {
    async doWithdrawSignedFromFIBER(req: any, swapAndWithdrawTransactionObject: any) {
        
        let withdrawHash = await fiberHelper.doWithdrawSigned(req, swapAndWithdrawTransactionObject);
        if (withdrawHash) {
            console.log('doSwapAndWithdraw withdrawHash', withdrawHash);

        }

        let filter: any = {};
        filter._id = swapAndWithdrawTransactionObject._id;

        if (!swapAndWithdrawTransactionObject) {
            throw 'Invalid operation';
        }

        let useTransaction = {
            transactionId: withdrawHash,
            status: utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted,
            timestamp: new Date()
        }

        if (swapAndWithdrawTransactionObject.useTransactions && swapAndWithdrawTransactionObject.useTransactions.length > 0) {
            let txItem = (swapAndWithdrawTransactionObject.useTransactions || []).find((t: any) => t.transactionId === req.body.withdrawTxId);
            if (!txItem) {
                swapAndWithdrawTransactionObject.useTransactions.push(useTransaction);
            }
        } else {
            swapAndWithdrawTransactionObject.useTransactions.push(useTransaction);
        }

        swapAndWithdrawTransactionObject.updatedByUser = req.user._id;
        swapAndWithdrawTransactionObject.updatedAt = new Date();
        swapAndWithdrawTransactionObject = await db.SwapAndWithdrawTransactions.findOneAndUpdate(filter, swapAndWithdrawTransactionObject);
        return swapAndWithdrawTransactionObject;
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
        let apiKey = process.env.apiKeyForGateway || "";
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