/* ------------------------------------------------------------------

        GENERIC HELPER FUNCIONS FOR BLOCKCHAIN OPERATIONS

-------------------------------------------------------------------*/
var Web3 = require('web3')
var web3 = new Web3(); 

var default_contract_address;
var default_contract_abi;
var default_contract_methods;
var default_contract_events;

const DEF_GASLIMIT = 500000;
const DEF_GASPRICE = 1;
const DEF_MINED = false;

/*-----------------------------------------------------------------*/

function setProvider(rpcEndpoint) {
    if (rpcEndpoint.includes("http")) {
        web3  = new Web3( new Web3.providers.HttpProvider(rpcEndpoint));
    } else if (rpcEndpoint.includes("ws")) {
        web3 = new Web3(new Web3.providers.WebsocketProvider(rpcEndpoint));
    }
}

function setDefaultContractAddress (addr) {
    if (validAddress(addr)) {
        default_contract_address = Web3.utils.toChecksumAddress(addr);
        return true;
    }
    return false;
}
function setDefaultContractAbi (abi) {
    if (Array.isArray(abi)) {
        default_contract_abi = abi;
        return true;
    } else {
        return false;
    }
}
function setDefaultContractMethods (m) {
    default_contract_methods = m;
}
function setDefaultContractEvents (e) {
    default_contract_events = e;
}

/* ------------------------------------------------------------------
    ADDRESSES , TX and BLOCKS
-------------------------------------------------------------------*/


// Check if the provides tring is a valid hex rapresentation
// of n bytes (case insensitive)
// string must start with "0x"
function validBytes(n, str) {
    var r = "^0x[a-f0-9]{"+(2*n).toString()+"}$";
    var regex = new RegExp(r,"i");
    return str.match(regex) !== null;
}

// Check if the provides tring is a valid address (case insensitive)
function validAddress(addr) {
    return validBytes(20, addr);
}

// Check if the provides tring is a valid address (Checksum case)
function validChecksumAddress(addr) {
    return ( (validAddress(addr)) && (addr == Web3.utils.toChecksumAddress(addr)) );
}

function priv2address(priv) {
    var web3l = new Web3();
    return web3l.eth.accounts.privateKeyToAccount(priv, true);
}

function v3wallet2priv(jv3, pass) {
    // Check if it's a ethers wallet
    if (jv3["x-ethers"]) {
        // This wallet is from ethers so we need some fixing...
        delete jv3["x-ethers"];
        jv3["crypto"] = jv3["Crypto"];
        delete jv3["Crypto"];
    }

    var acc = web3.eth.accounts.decrypt(jv3, pass);
    return acc.privateKey;
}


function priv2v3wallet(priv, pass) {
    // WATCH OUT : no checks
    var jv3 = web3.eth.accounts.encrypt(priv, pass);
    return jv3;
}


// Get the tx receipt from a tx hash
// It's just a wrapper function to avoid having to deal with web3
async function waitForReceipt(txh) {
    return await web3.eth.getTransactionReceipt(txh);
}

// Given a tx hash returns the transaction structure 
async function hash2tx(txh) {
    return await web3.eth.getTransaction(txh);
}

// Return the timestamp of a block
async function getBlockTimestamp(blkh) {
    var blk = await web3.eth.getBlock(blkh);
    return (blk['timestamp']);
}

// Return the timestamp of a transaction
async function getTxTimestamp(txh) {
    var tx = hash2tx(txh);
    return(getBlockTimestamp(tx['blockHash']));
}

/* ------------------------------------------------------------------
    SMART CONTRACTS INTERACTION
-------------------------------------------------------------------*/

// Get the ABI of a smart contract and returns an object
// contract_events: signature --> event object
function mapEvevents(local_contract_abi = default_contract_abi) {
    if ( ! Array.isArray(local_contract_abi) ) {return null;}
    contract_events = {};
    var l = local_contract_abi.length;
    var w3e = new Web3();
    for (var i=0; i<l; i++) {
        // Use only events
        if (local_contract_abi[i]["type"] != "event" ) {continue;}
        var sig = w3e.eth.abi.encodeEventSignature(local_contract_abi[i]);
        contract_events[sig] = local_contract_abi[i];
    }
    setDefaultContractEvents(contract_events);
    return contract_events;
}

// Get the ABI of a smart contract and returns an object
// contract methods : signature --> write method object
function mapMethods(local_contract_abi = default_contract_abi) {
    if ( ! Array.isArray(local_contract_abi) ) {return null;}
    contract_methods =  {};
    var l = local_contract_abi.length;
    var w3e = new Web3();
    for (var i=0; i<l; i++) {
        // Use only non-constant methods (transactions)
        if (local_contract_abi[i]["type"] != "function" ) {continue;}
        if (local_contract_abi[i]["constant"] == true ) {continue;}
        if (local_contract_abi[i]["stateMutability"] == "view" ) {continue;}
        if (local_contract_abi[i]["stateMutability"] == "pure" ) {continue;}
        var sig = w3e.eth.abi.encodeFunctionSignature(local_contract_abi[i]);
        contract_methods[sig] = local_contract_abi[i];    
    }
    setDefaultContractMethods(contract_methods);
    return contract_methods;
}

// Which events fired during a transaction?
// Get a transaction receipt, 
//      an object with smart contract events (from mapEvents)
//      a flag for output format (json/string) 
// Returns a (json/string) with all the events fired in the tx receipt
function decodeEvents(recp, local_contract_events = default_contract_events,  jsonf = true) {
    var dec = "";
    var j = [];
    var w3e = new Web3();
    for (var i=0; i<recp["logs"].length; i++) {
        var log = recp["logs"][i];
        if (local_contract_events[ log["topics"][0] ] == undefined) {continue;}

        var o;
        if (! local_contract_events[ log["topics"][0] ].anonymous) {
            o = w3e.eth.abi.decodeLog( local_contract_events[ log["topics"][0] ].inputs, log["data"], log["topics"].slice(1));
        } else {
            o = w3e.eth.abi.decodeLog( local_contract_events[ log["topics"][0] ].inputs, log["data"], log["topics"]);
        }

        // Assign to export variables
        j.push({"name" : local_contract_events[ log["topics"][0] ].name, "values": o});
        dec += local_contract_events[ log["topics"][0] ].name+":\n"+JSON.stringify(o, null, 4)+"\n";
    }
    return (jsonf ? j : dec);
}

// What input was provided to a tx (method to sc) ?
// Gets a transaction,
//      an object with the sc methods (from mapMethods)
// Returns a string with the smart contract cal parameters
function decodeInput(tx, local_contract_methods = default_contract_methods) {
    var dec = "";
    var w3e = new Web3();
    var sig = tx.input.slice(0,10);
    dec = local_contract_methods[sig].name+":\n";
    dec += JSON.stringify(w3e.eth.abi.decodeParameters(local_contract_methods[sig].inputs , tx.input.slice(10)), null, 4);
    dec += "\n";
    return dec;
}

async function getNonce(address) {
    return await web3.eth.getTransactionCount(address);
}


/* ------------------------------------------------------------------
    TRANSACTIONS
-------------------------------------------------------------------*/

// Pretty balance ;) in QDC/ETH
async function balance (addr) {
    var b = await web3.eth.getBalance(addr);
    return  web3.utils.fromWei(b);
}

// Balance in wei
async function balance_wei (addr) {
    return await web3.eth.getBalance(addr);
}

// Send a single wei transfer tx : 
// Get params: sender address, 
//          sender private key, 
//          receiver address,
//          value to transfer in wei
//          gasprice (defaults to 1 on Quadrans),
//          and a flag to specify the promise object (false ) 
// then form tx, sign it, send, 
// Returns promise on the tx (hash or receipt) depending on the mined flag
async function sendWei( sender, receiver, privkey, value, gasprice=1, mined=false, rawdata )  {
    var signonce = await web3.eth.getTransactionCount(sender);
    var chain = await web3.eth.getChainId();
    var tx = {
        "nonce" : signonce,
        "from" : sender, 
        "value" : value, 
        "gasPrice" : gasprice,
        "to" : receiver,
        "chainId" : chain
    }
    tx["gas"] = (await web3.eth.estimateGas(tx)); // should be 21000
    if (rawdata) {
        tx["data"] = rawdata;
        // Add Gas for data
        databytes = (rawdata.length - 2 ) / 2;
        extragas = 68 * databytes;
        tx["gas"] += extragas;
    }

    try {
        var signed = await web3.eth.accounts.signTransaction(tx, privkey);
    } catch (e) {
        throw(e);
    }

    // What to return? Mined tx or tx hash?
    if (mined) {
        // Return a promise that fires on tx receipt available    
        return new Promise ((resolve, reject) => {
            web3.eth.sendSignedTransaction(signed.rawTransaction)
                .on('receipt', (r) => {return resolve(r);})
                .on('error', (e) => {return reject(e);});
        })
    } 
    else {
        // Return a promise that fires on tx hash available
        return new Promise ((resolve, reject) => {
            web3.eth.sendSignedTransaction(signed.rawTransaction, 
            (err, txHash) => {
                return !err ? resolve(txHash) : reject(err)
            })
        })
    }
}


// Smart contract Read method (constant method)
// Gets:    the method to be called
//          the parameters (array)
//          the caller address (optional)
//          the contract address (optional , defaults to previously defined)
//          the contract abi (optional , defaults to previously defined)
// Returns: the result of the call (if any)
async function smartContractCall (callmethod, params, caller, local_contract_address = default_contract_address, contract_abi = default_contract_abi) {
    var contract = new web3.eth.Contract(contract_abi, local_contract_address);
    var res = await contract.methods[callmethod](...params).call({"from" : caller}); 
    return res;
}

// Smart contract Write method (transaction)
// Gets:    the method to be called
//          the parameters (array)
//          the sender address
//          the sender privatekey
//          the gaslimit (optional, can be derived)
//          the gasprice (defaults to 1 for quadrans)
//          the mined flag: if true returns a promise that fires on tx mined
//                          if false a promise that fires on tx hash available
//          the contract address (optional , defaults to previously defined)
//          the contract abi (optional , defaults to previously defined)
// Returns a promis (depending on the mined flag)
// async function smartContractTransaction (txmethod, params, sender, privkey, gaslimit, gasprice=1, mined = false, local_contract_address = default_contract_address, contract_abi = default_contract_abi) {
async function smartContractTransaction (txmethod, params, sender, privkey, ops) {
    // Get all parameters or defaults
    var gaslimit = ops.gaslimit || DEF_GASLIMIT;
    var gasprice = ops.gasprice || DEF_GASPRICE;
    var mined = ops.mined || DEF_MINED;
    var local_contract_address = ops.contrac_address || default_contract_address;
    var local_contract_abi = ops.local_contract_abi || default_contract_abi;

    // Compose transaction
    var contract = new web3.eth.Contract(local_contract_abi, local_contract_address);
    var signonce = await web3.eth.getTransactionCount(sender);
    var txdata = contract.methods[txmethod](...params).encodeABI();
    var tx = {
        "from" : sender,
        "to" : local_contract_address,
        "gasPrice" : gasprice,
        "nonce" : signonce,
        "data" : txdata,
        "value" : 0,
    };
    if (gaslimit == -1) {
        gaslimit = await contract.methods[txmethod](...params).estimateGas({from: sender});
    }
    tx["gas"] = gaslimit;

    //Sign
    var signed = await web3.eth.accounts.signTransaction(tx, privkey);
 
    //Send, What to return? Mined tx or tx hash?
    if (mined) {
        // Return a promise that fires on tx receipt available    
        return new Promise ((resolve, reject) => {
            web3.eth.sendSignedTransaction(signed.rawTransaction)
                .on('receipt', (r) => {return resolve(r);})
                .on('error', (e) => {return reject(e);});
        })
    } 
    else {
        // Return a promise that fires on tx hash available
        return new Promise ((resolve, reject) => {
            web3.eth.sendSignedTransaction(signed.rawTransaction, 
            (err, txHash) => {
                return !err ? resolve(txHash) : reject(err)
            })
        })
    }
    
}


/* ------------------------------------------------------------------
    SIGNATURES
-------------------------------------------------------------------*/

async function signMessage (message, privkey) {
    var signature = await web3.eth.accounts.sign(message, privkey);
    return signature.signature;
}

async function verifySignature (message, signature) {
    var address = await web3.eth.accounts.recover (message, signature);
    return address;
}


/* ------------------------------------------------------------------
    MODULE EXPORTS
-------------------------------------------------------------------*/

module.exports = {
    setProvider,
    setDefaultContractAddress,
    setDefaultContractAbi,
    setDefaultContractMethods,
    setDefaultContractEvents,
    validBytes,
    validAddress,
    validChecksumAddress,
    priv2address,
    v3wallet2priv,
    priv2v3wallet,
    waitForReceipt,
    hash2tx,
    balance,
    balance_wei,
    getNonce,
    getTxTimestamp,
    getBlockTimestamp,
    mapEvevents,
    mapMethods,
    decodeEvents,
    decodeInput,
    sendWei,
    smartContractCall,
    smartContractTransaction,
    signMessage,
    verifySignature
}