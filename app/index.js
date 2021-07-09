const express = require('express');
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser');
const Miner = require('./miner');

const cors = require("cors")
//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

//create a new app
const app  = express();

//using the blody parser middleware
app.use(bodyParser.json());
app.use(cors())

// create a new blockchain instance
const blockchain = new Blockchain();

const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
// create a new wallet
const wallet = new Wallet();


// create a new transaction pool which will be later
// decentralized and synchronized using the peer to peer server
const transactionPool = new TransactionPool();



const P2pServer = require('./p2p-server.js');
const p2pserver = new P2pServer(blockchain,transactionPool);

const miner = new Miner(
    blockchain,
    transactionPool,
    p2pserver,
    wallet
);




//EXPOSED APIs

//api to get the blocks
app.get('/blocks',(req,res)=>{

    res.json(blockchain.chain);

});

app.get('/balance',(req,res)=>{

    res.json(wallet.updateBalance(blockchain, transactionPool));

});


// api to view transaction in the transaction pool
app.get('/transactions',(req,res)=>{
    res.json(transactionPool.transactions);
    });

    app.get('/owntx',(req,res)=>{
        res.json(wallet.getAllTransactions(blockchain, transactionPool));
        });


    // create transactions
    app.post('/transact',(req,res)=>{
        const { toAddress, amount } = req.body;
        const transaction = wallet.createTransaction(toAddress,
                    amount,blockchain,transactionPool);

        if(!transaction){
            res.json({error : `Amount: ${amount} exceeds the current balance`})
        }

        p2pserver.broadcastTransaction(transaction);
        res.redirect('/transactions');
        });


app.get('/public-key',(req,res)=>{
       res.json({publicKey: wallet.publicKey});
     })



app.get('/mine-transactions',(req,res)=>{
    const block = miner.mine(); 
    if (!block) res.json({error : 'No pending transactions'});

    console.log(`New block added: ${block.toString()}`);
    res.redirect('/blocks');
 })

// app server configurations
app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})


p2pserver.listen(); // starts the p2pserver
