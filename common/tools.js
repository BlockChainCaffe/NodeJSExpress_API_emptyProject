const sha256 = require('js-sha256')


// Translate Hex to ASCII 
// 0x30 -> '0'
// 0x42 -> 'A' ... and so on
function h2a (str1) {
    var hex  = str1.toString()
    var str = ''
    for (var n = 0; n < hex.length; n += 2) {
        c = String.fromCharCode(parseInt(hex.substr(n, 2), 16))
        if (c== '\u0000') {
            return str
        }
        str += c
    }
    return str
}

// Reverse the previous one
function a2h (str) {
    var hex = '';
    for (var n=0; n<str.length; n++) {
        c = ('00'+str.charAt(n).charCodeAt(0).toString(16)).slice(-2);
        hex += c;
    }
    return hex;
}

function byte2h (byte) {
    return ('00'+byte.toString(16)).slice(-2)
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d)
  }


function date2h(date_in) {
    var date    = new Date(date_in)
    if (! isValidDate(date)) {
        return false
    }

    var year    = ('0000'+date.getFullYear().toString(16)).slice(-4)
    var month   = ('00'+(date.getMonth()+1).toString(16)).slice(-2)
    var day     = ('00'+date.getDate().toString(16)).slice(-2)
    return year+month+day
}

// Note: hex is a hex string
function h2Date(hex) {
    var year    = parseInt(hex.substring(0,4), 16)
    var month   = parseInt(hex.substring(4,6), 16)
    var day     = parseInt(hex.substring(6,8), 16)
    var date    = new Date(year.toString() + "/" + month.toString() + "/" + day.toString())
    return date.toDateString()
}


function randomHash(seed, rounds=3) {
    let hash
    for (let i=0; i<rounds; i++) {
        let d = sha256(Date.now().toString())
        let r = sha256((Math.random()*10000000019).toString())
        hash = sha256(hash+r+d)
    }
    return hash
}

/* ------------------------------------------------------------------
    MODULE EXPORTS
-------------------------------------------------------------------*/

module.exports = {
    h2a,
    a2h,
    date2h,
    h2Date,
    byte2h,
    randomHash
}