const WebSocket = require('ws');

//declare the peer to peer server port 
const P2P_PORT = process.env.P2P_PORT || 5001;

//list of address to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const MESSAGE_TYPE = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS'
    }

class P2pserver{
    constructor(blockchain, transactionPool){
        this.blockchain = blockchain;
        this.nodes = [];
        this.transactionPool = transactionPool;

    }

    

    // create a new p2p server and connections

    listen(){
        // create the p2p server with port as argument
        const server = new WebSocket.Server({ port: P2P_PORT });

        // event listener and a callback function for any new connection
        // on any new connection the current instance will send the current chain
        // to the newly connected peer
        server.on('connection', node => this.connectNode(node));
        
        // to connect to the peers that we have specified
        this.connectToPeers();

        console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
    }

    // after making connection to a node
    connectNode(node){

        // push the node too the node array
        this.nodes.push(node);
        console.log("Node connected");

        // register a message event listener to the node
        this.messageHandler(node);

        // on new connection send the blockchain chain to the peer

        this.sendChain(node);
        
    }

    connectToPeers(){

        //connect to each peer
        peers.forEach(peer => {

            // create a node (socket) for each peer
            const node = new WebSocket(peer);
            
            // open event listner is emitted when a connection is established
            // saving the socket in the array
            node.on('open',() => this.connectNode(node));
         
        });
    }

    messageHandler(node){
        //on recieving a message execute a callback function
        node.on('message',message =>{
            const data = JSON.parse(message);
            console.log("data ", data);

            switch(data.type){
                case MESSAGE_TYPE.chain:
                    /**
                     * call replace blockchain if the 
                     * recieved chain is longer it will replace it
                     */
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPE.transaction:
                    /**
                     * add transaction to the transaction
                     * pool or replace with existing one
                     */
                    this.transactionPool.updateOrAddTransaction(data.transaction);


                    break;

                    case MESSAGE_TYPE.clear_transactions:
                        /**
                        * clear the transactionpool
                        */
                        this.transactionPool.clear();
                        break;
            }
            
        });
    }
    /**
     * helper function to send the chain instance
     */

     sendChain(node){
        node.send(JSON.stringify({
        type: MESSAGE_TYPE.chain,
        chain: this.blockchain.chain
    }));
    }

    /**
     * utility function to sync the chain
     * whenever a new block is added to
     * the blockchain
     */


     sendTransaction(node,transaction){
        node.send(JSON.stringify({
            type: MESSAGE_TYPE.transaction,
            transaction: transaction
          })
      );
    }

    syncChain(){
        this.nodes.forEach(node =>{
            this.sendChain(node);
        });
    }

    broadcastTransaction(transaction){
        this.nodes.forEach(node =>{
            this.sendTransaction(node,transaction);
        });
    }


    broadcastClearTransactions(){
        this.nodes.forEach(node => {
        node.send(JSON.stringify({
        type: MESSAGE_TYPE.clear_transactions
        }))
        })
        }




}

module.exports = P2pserver;