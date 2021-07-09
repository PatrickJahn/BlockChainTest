const ChainUtil = require('../chain-util');
const {MINING_REWARD} = require("../config")
const SHA256 = require('crypto-js/sha256');

class Transaction{
    constructor(){

        // this.input = null;
        // this.outputs = [];

        this.toAddress = "";
        this.fromAddress = "";
        this.amount = 0
        //this.senderBalance = 0
        this.timestamp = ""
        this.signature = ""
        this.status = ""
        this.hash = ""
    }

    /**
     * add extra ouputs to the transactions
     */

    update(senderWallet,recipient,amount){
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

        if(amount > senderWallet.balance){
            console.log(`Amount ${amount} exceeds balance`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({amount: amount,address: recipient});
        Transaction.signTransaction(this,senderWallet);

        return this;
    }

    /**
     * create a new transaction
     */
     static newTransaction(senderWallet,toAddress,amount){
        if(amount > senderWallet.balance){
                    console.log(`Amount : ${amount} exceeds the balance`);
                    return;
                }
                // call to the helper function that creates and signs the
                // transaction outputs

                let tx = new this();
                tx.fromAddress = senderWallet.publicKey
                tx.toAddress = toAddress
                tx.amount = amount
                tx.timestamp = Date.now()
                tx.hash = SHA256(tx.toAddress + tx.fromAddress + tx.amount + tx.timestamp).toString()
                // tx.senderBalance = senderWallet.balance - amount
                Transaction.signTransaction(tx,senderWallet);
                return tx;
                // return Transaction.transactionWithOutputs(senderWallet,[
                //     {amount:  senderWallet.balance -amount,
                //      address: senderWallet.publicKey},
                //     {amount:  amount,address: recipient}
                // ])
        }

        static rewardTransaction(minerWallet, blockchainWallet){
           
            let tx = new this();
            tx.amount = MINING_REWARD;
            tx.toAddress = minerWallet.publicKey
            tx.fromAddress = blockchainWallet.publicKey
            this.timestamp = Date.now()
            tx.status = "Pending"
            tx.hash = SHA256(this.toAddress + this.fromAddress + this.amount + this.timestamp).toString();
            Transaction.signTransaction(tx, blockchainWallet)

            return tx;
            // return Transaction.transactionWithOutputs(
            //     blockchainWallet,[{
            //     amount: MINING_REWARD,
            //     address: minerWallet.publicKey
            // }]);
        }

    /**
     * create input and sign the outputs
     */

    static signTransaction(transaction,senderWallet){

        transaction.timestamp = Date.now();
        transaction.signature = senderWallet.sign(SHA256(this.toAddress + this.fromAddress + this.amount + this.timestamp).toString())


        // transaction.input = {
        //     timestamp: Date.now(),
        //     amount: senderWallet.balance,
        //     address: senderWallet.publicKey,
        //     signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        // }
    }

    /**
     * verify the transaction by decrypting and matching
     */


     static verifyTransaction(transaction){

        if (transaction.fromAddress.length < 1) {
            return false
        }

        return ChainUtil.verifySignature(
            transaction.fromAddress,
            transaction.signature,
            SHA256(this.toAddress + this.fromAddress + this.amount + this.timestamp).toString()
        )
    }
    // static verifyTransaction(transaction){
    //     return ChainUtil.verifySignature(
    //         transaction.input.address,
    //         transaction.input.signature,
    //         ChainUtil.hash(transaction.outputs)
    //     )
    // }



    // static transactionWithOutputs(senderWallet,outputs){
    //     const transaction = new this();
    //     transaction.outputs.push(...outputs);
    //     console.log(senderWallet +  " SENDER WALLET")
    //     Transaction.signTransaction(transaction,senderWallet);
    //     return transaction;
    // }



    calculateHash(){
        return SHA256(this.toAddress + this.fromAddress + this.amount + this.timestamp).toString();
    }


    
}

module.exports = Transaction;