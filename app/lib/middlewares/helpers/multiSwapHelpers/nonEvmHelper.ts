const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate");

module.exports = {

    async getTransactionByHash(hash: any, rpc: any) {
        let client = await SigningCosmWasmClient.connectWithSigner(rpc);
        let txResp = await client.getTx(hash);
        txResp.status = false;
        if(txResp && txResp.code == 0){
            txResp.status = true;
        }
        return txResp;
    }
    
}