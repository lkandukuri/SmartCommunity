var ejs = require("ejs");
var mysql = require('./mysql');

function initiatechat(req,res) {

    var owner= req.body.owner;
    if(req.session.username){
        var user = req.session.username

        console.log("---------Initiate chat between "+ user + "  " + owner+"--------------");

    }

}
exports.intiatechat=initiatechat;