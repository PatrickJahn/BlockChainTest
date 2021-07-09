
const {MINING_REWARD} = require("../config")
const Transaction = require("../wallet/transaction")
const Wallet = require("../wallet/index")

class Miner{

    constructor(blockchain, transactionPool, p2pServer, wallet){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.p2pServer = p2pServer;
        this.wallet = wallet
    }

    mine(){

        const validTransactions = this.transactionPool.validTransactions();
        console.log("Transactions pending: " + validTransactions)

        if (this.transactionPoolIsEmpty(validTransactions)) return false;
        
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
        const newBlock = this.changeTransactionsStatus(validTransactions)

        const block = this.blockchain.addBlock(newBlock);
        this.p2pServer.syncChain();
        this.transactionPool.clear();
        this.p2pServer.broadcastClearTransactions();
        return block;
    }



    transactionPoolIsEmpty(validTransactions){
        if (validTransactions.length > 0) {
            return false
        } 

        return true;
    }

    changeTransactionsStatus(validTransactions){

    return validTransactions.map((tx) =>{
        tx.status = "Validated"
        return tx;
    })

    }
}

module.exports = Miner