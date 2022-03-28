const { db } = global;

module.exports = {
    async createSnapshotMeta(contractAddress, blockNumber = "0") {
        const filter = {tokenContractAddress : contractAddress, isActive :true}
        const payload = {tokenContractAddress : contractAddress, isActive :true, currentBlockNumber:blockNumber}
        let meta = await db.CompetitionTransactionsSnapshotMeta.findOne(filter)
        if(meta === null){
            meta = await db.CompetitionTransactionsSnapshotMeta.create(payload)
        }
        return meta;
    },

    async getActiveSnapshotMetas(){
        const filter = {isActive:true}
        return await db.CompetitionTransactionsSnapshotMeta.find(filter)
    },

    async updateMetaByContractAddress(tokenContractAddress, startBlockNumber, endBlockNumber){
        const filter = {tokenContractAddress, isActive:true};  
        let meta = await db.CompetitionTransactionsSnapshotMeta.findOne(filter);     
        if(meta){
            meta.blocksNumbers.push(`${startBlockNumber} - ${endBlockNumber}`);
            meta.currentBlockNumber = ++endBlockNumber;
            meta.save();
        }
    },

    async insertTransactionsSnapshot(transactions){
       const snapShot = await db.CompetitionTransactionsSnapshots.insertMany(transactions)
       return snapShot 
    }


}