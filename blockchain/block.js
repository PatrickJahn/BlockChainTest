const SHA256 = require('crypto-js/sha256');
const { DIFFICULTY, MINE_RATE } = require('../config.js');

class Block{
    constructor(timestamp,lastHash,hash,transactions,nonce,difficulty){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.transactions = transactions;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    /**
     * returns what the object looks like
     * substring is used to make it look nice
     * hashes are too big to printed on command line 
     */

    toString(){
        return `Block - 
        Timestamp : ${this.timestamp}
        Last Hash : ${this.lastHash.substring(0,10)}
        Hash      : ${this.hash.substring(0,10)}
        Nonce     : ${this.nonce}
        Transactions      : ${this.transactions}
        Difficulty: ${this.difficulty}`;
    }

    /**
     * function to create the first block or the genesis block
     */

    static genesis(){
        return new this('Genesis time','----','f1574-h4gh',[],0,DIFFICULTY);
    }

    /**
     * function to create new blocks or to mine new blocks
     */

    static mineBlock(lastBlock, transactions){

        let hash;
        let timestamp;
        const lastHash = lastBlock.hash;

        let { difficulty } = lastBlock;

        let nonce = 0;
        //generate the hash of the block
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock,timestamp);
            hash = Block.hash(timestamp,lastHash,transactions,nonce,difficulty);
            // checking if we have the required no of leading number of zeros
        } while(hash.substring(0,difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp,lastHash,hash,transactions,nonce,difficulty);
    }

    /**
     * function to create the hash value of the block data
     */

    static hash(timestamp,lastHash,transactions,nonce,difficulty){
        return SHA256(`${timestamp}${lastHash}${transactions}${nonce}${difficulty}`).toString();
    }

    /**
     * return the hash value of the passed block
     */

    static blockHash(block){
        //destructuring
        const { timestamp, lastHash, transactions, nonce,difficulty } = block;
        return Block.hash(timestamp,lastHash,transactions,nonce,difficulty);
    }

    /**
     * utility function to adjust difficulty
     */

     static adjustDifficulty(lastBlock,currentTime){
         let { difficulty } = lastBlock;
         difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1; 
         return difficulty; 
     }

}

// share this class by exporting it

module.exports = Block;