var ejs = require("ejs");
var mysql = require('./mysql');
var AWS = require('aws-sdk');
var $ = require('jquery');
var moment = require('moment');


AWS.config.update({
    accessKeyId: "xxxxxx",
    secretAccessKey: "xxxxxxxxx",
    region:'us-west-2',
    sslEnabled: true,
});


function initiateemail(req,res) {

    var owner= req.body.owner;
    if(req.session.username){
        var user = req.session.username;

        ejs.renderFile('./views/chat.ejs', {user: userObj, posts: posts}, function (err, result) {
            // if it is success
            if (!err) {

//-- Clear Chat


                res.end(result);

            }
            //ERROR
            else {
                res.end("ERROR OCCURED ");
                console.log(err);
            }
        });

    }

}

function initiatechat(req,res) {

    var chatobject= req.params.i;
    console.log("ChatObject: "+chatobject);

    if(req.session.username){
        var user = req.session.username;
        console.log("logged in user: "+user);

        var getposts = "select id,username,title,description,imagepath from posts where username !='" + user + "'"+"AND access='true'";
        var posts = [];
        mysql.fetchData(function (err, result) {
            if (result.length > 0) {

                console.log("---------------posts found -----");
                for (var i = 0; i < result.length; i++) {
                    var post = {
                        id:result[i].id,
                        title: result[i].title,
                        description: result[i].description,
                        path: result[i].imagepath,
                        username:result[i].username

                    }
                    console.log("---------------posts found -----" + post.id+post.title + post.description+post.username + post.path);
                    posts.push(post);
                }

                var x = req.params.i;
                x = x.replace(/:/, "");
                global.vendor = posts[x].username;
                var string1 = user + "_" + posts[x].username;
                var string2 =  posts[x].username + "_" + user ;

                var sqlQuery = "select idchat,from_user,to_user,message,created from chat where chatlink IN ('" + string1 + "','"+string2+"')";
                console.log(sqlQuery);

                mysql.fetchData(function (err,result) {
                    if(err)
                    {
                        res.end("ERROR OCCURED ");
                        console.log(err);
                    }
                    else
                    {
                        console.log("---------------CHAT -----");
                        console.log(result);

                        ejs.renderFile('./views/chat.ejs', {result: result,moment: moment}, function (err, result) {
                            if (!err) {
                                res.end(result);

                            }
                            else {
                                res.end("ERROR OCCURED ");
                                console.log(err);
                            }
                        });

                    }
                },sqlQuery);
            }


        }, getposts);


    }
}


function sendmessage(req,res) {

    console.log(global.vendor + " " + global.userObj.username)
    var message = req.body.Message;
    console.log(message);


var link=global.userObj.username+"_"+global.vendor;
    var insertQuery = "INSERT INTO chat (from_user, to_user, message,chatlink) VALUES ('"+global.userObj.username+"','"+global.vendor+"','"+message+"','"+link+"')";
    mysql.insertData(function (err, result) {
        if (result) {

            console.log("Result after insert"+result);

            var string1 = global.userObj.username + "_" + global.vendor;
            var string2 =  global.vendor + "_" + global.userObj.username ;

            var sqlQuery = "select idchat,from_user,to_user,message,created from chat where chatlink IN ('" + string1 + "','"+string2+"')";
            console.log(sqlQuery);

            mysql.fetchData(function (err,result) {
                if(err)
                {
                    res.end("ERROR OCCURED ");
                    console.log(err);
                }
                else
                {
                    console.log("---------------CHAT -----");
                    console.log(result);

                    ejs.renderFile('./views/chat.ejs', {result: result}, function (err, result) {
                        if (!err) {
                            res.end(result);

                        }
                        else {
                            res.end("ERROR OCCURED ");
                            console.log(err);
                        }
                    });

                }
            },sqlQuery);
        }

    }, insertQuery);



}

//-- NOTE: No use time on insertChat.

exports.initiateemail=initiateemail;
exports.initiatechat=initiatechat;
exports.sendmessage=sendmessage;
