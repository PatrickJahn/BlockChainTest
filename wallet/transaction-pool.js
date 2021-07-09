const Transaction = require('./transaction');

class TransactionPool{
    constructor(){
        // represents a collections of transactions in the pool
        this.transactions = [];
    }

    /** 
     * this method will add a transaction
     * it is possible that the transaction exists already
     * so it will replace the transaction with the new transaction
     * after checking the input id and adding new outputs if any
     * we call this method and replace the transaction in the pool
     */
    updateOrAddTransaction(transaction){
        // get the transaction while checking if it exists
        // let transactionWithHash = this.transactions.find(t => t.hash === transaction.hash);

        // if(transactionWithHash){
        //     this.transactions[this.transactions.indexOf(transactionWithHash)] = transaction;
        // }
        // else{
            transaction.status = "Pending"
            this.transactions.push(transaction);
        // }
    }

    existingTransaction(address){
        return this.transactions.find(t => t.fromWallet.publicKey === address);
        }

    validTransactions(){
            /**
             * valid transactions are the one whose total output amounts to the input
             * and whose signatures are same
             */
            return this.transactions.filter((transaction)=>{
                
                // reduce function adds up all the items and saves it in variable
                // passed in the arguments, second param is the initial value of the 
                // sum total
    
                // const outputTotal = transaction.outputs.reduce((total,output)=>{
                //     return total + output.amount;
                // },0)
                // if( transaction.senderBalance !== outputTotal ){
                //     console.log(`Invalid transaction from ${transaction.input.address}`);
                //     return;
                // }
    
                if(!Transaction.verifyTransaction(transaction)){
                    console.log(`Invalid signature from ${transaction.input.address}`);
                    return;
                }

                
    
                return transaction;
            })
        }

        clear(){
            this.transactions = [];
            }
}

module.exports = TransactionPool;