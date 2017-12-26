var ejs = require("ejs");
var mysql = require('./mysql');
var AWS = require('aws-sdk');
var $ = require('jquery');
var moment = require('moment');


AWS.config.update({
    accessKeyId: "AKIAIHRIILOILOENQVFA",
    secretAccessKey: "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",
    region:'us-west-2',
    sslEnabled: true,
});




function initiateemail(req,res) {

    var owner= req.params.toUser.substr(1);
    if(req.session.username){
        var user = req.session.username


        console.log("---------Initiate email between "+ user + "  " + owner+"--------------");

        // load AWS SES
        var ses = new AWS.SES({apiVersion: '2010-12-01'});

          var getemail= "select email from users where username ='"+owner+"';"+
            "select email from users where username ='"+user+"';";

           mysql.fetchData(function (err,result) {
               if(err)
               {
                   res.end("ERROR OCCURED ");
                   console.log(err);
               }
               else
               {
                   console.log("---------------get email query succesful -----");
                   if(result.length > 1){
                       console.log("---------------email found -----");
                       console.log(result)

                       toemail = result[0][0].email;

                       // send to list
                       var to = [toemail]

           // this must relate to a verified SES account
                       var from = result[1][0].email;//req.session.email


                       console.log(toemail+","+from);
                       ses.sendEmail( {
                               Source: from,
                               Destination: { ToAddresses: to },
                               Message: {
                                   Subject: {
                                       Data: 'Hi!! I am interested in your post'
                                   },
                                   Body: {
                                       Text: {
                                           Data: 'Hi!! I am interested in your post',
                                       }
                                   }
                               }
                           }
                           , function(err, data) {
                               if(err) throw err
                               console.log('Email sent:');
                               console.log(data);
                           });

                   }
                   else{
                       res.end("No user Found!!")
                   }



               }
           },getemail); 





// // send to list
//         var to = ['nikhila.galala@sjsu.edu']

// // this must relate to a verified SES account
//         var from = user;//'nikhilagalala@gmail.com'



//         ses.sendEmail( {
//                 Source: from,
//                 Destination: { ToAddresses: to },
//                 Message: {
//                     Subject: {
//                         Data: 'Hi!! I am interested in your post'
//                     },
//                     Body: {
//                         Text: {
//                             Data: 'Hi!! I am interested in your post',
//                         }
//                     }
//                 }
//             }
//             , function(err, data) {
//                 if(err) throw err
//                 console.log('Email sent:');
//                 console.log(data);
//             });

//         res.end("Email sent!!")


    }

}

function initiatechat(req,res) {

    var chatobject= req.params.i;
    console.log("ChatObject: "+chatobject);
    var moment = moment;

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
                        
                        for(i=0;i<result.length;i++)
                        {
                            var sqlQuery_update = "UPDATE chat SET message_read=TRUE WHERE idchat = " + result[i].idchat + " AND from_user != '" + req.session.username + "'";
                            mysql.fetchData(function (err,result){
                            if(err)
                            {
                                res.end("ERROR OCCURED ");
                                console.log(err);
                            }
                            else
                            {
                                 console.log("-----UPDATED-----");
                            }
                        },sqlQuery_update);

                        }
                        //var sqlQuery_update = "UPDATE chat SET message_read=TRUE WHERE idchat IN (select idchat from chat where chatlink IN ('"+string1 + "','"+string2+"') AND message_read = FALSE)";

                        

                        ejs.renderFile('./views/chat.ejs', {
                            result: result,
                            moment: moment
                        }, function (err, result) {
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

/*function initiatechatbyfromandtouser(req,res) {

    var fromUser = req.params.a;
    if (fromUser) {
        fromUser = fromUser.substr(1);
    }
    var toUser = req.params.b;
    if (toUser) {
        toUser = toUser.substr(1);
    }


    console.log("from user and to user: "+fromUser+","+toUser);
    var moment = moment;

    if(fromUser && toUser){

        // var x = req.params.i;
        // x = x.replace(/:/, "");
        // global.vendor = posts[x].username;
        var string1 = fromUser + "_" + toUser;
        var string2 =  toUser + "_" + fromUser ;

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
                
                var sqlQuery_update = "UPDATE chat SET message_read=TRUE where chatlink IN ('" + string1 + "','"+string2+"')";
                mysql.fetchData(function (err,result){
                    if(err)
                    {
                        res.end("ERROR OCCURED ");
                        console.log(err);
                    }
                    else
                    {
                         console.log("-----UPDATED-----");
                    }
                },sqlQuery_update);

                //var sqlQuery_update = "UPDATE chat SET message_read=TRUE WHERE idchat IN (select idchat from chat where chatlink IN ('"+string1 + "','"+string2+"') AND message_read = FALSE)";

                

                ejs.renderFile('./views/chat.ejs', {
                    result: result,
                    moment: moment
                }, function (err, result) {
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
}*/

function initiatechatbyfromandtouser(req,res) {

    var fromUser = req.params.a;
    if (fromUser) {
        fromUser = fromUser.substr(1);
        global.vendor = fromUser;
    }
    var toUser = req.params.b;
    if (toUser) {
        toUser = toUser.substr(1);

    }


    console.log("from user and to user: "+fromUser+","+toUser);
    var moment = moment;

    if(fromUser && toUser){

        // var x = req.params.i;
        // x = x.replace(/:/, "");
        // global.vendor = posts[x].username;
        var string1 = fromUser + "_" + toUser;
        var string2 =  toUser + "_" + fromUser ;

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

                var sqlQuery_update = "UPDATE chat SET message_read=TRUE where chatlink IN ('" + string1 + "','"+string2+"')";
                mysql.fetchData(function (err,result){
                    if(err)
                    {
                        res.end("ERROR OCCURED ");
                        console.log(err);
                    }
                    else
                    {
                        console.log("-----UPDATED-----");
                    }
                },sqlQuery_update);

                //var sqlQuery_update = "UPDATE chat SET message_read=TRUE WHERE idchat IN (select idchat from chat where chatlink IN ('"+string1 + "','"+string2+"') AND message_read = FALSE)";



                ejs.renderFile('./views/chat.ejs', {
                    result: result,
                    moment: moment
                }, function (err, result) {
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

/*function initiatechat(req,res) {

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
                req.session.user2 = posts[x].username;
                var string1 = user + "_" + posts[x].username;
                var string2 =  posts[x].username + "_" + user ;



                        console.log("---------------CHAT -----");
                        console.log(result);

                        ejs.renderFile('./views/chat.ejs', {
                                owner: posts[x].username, 
                                result: result
                            }, function (err, result) {
                            if (!err) {
                                res.end(result);

                            }
                            else {
                                res.end("ERROR OCCURED ");
                                console.log(err);
                            }
                        });



            }


        }, getposts);


    }
}

function sendmessage(req,res) {

    console.log(global.vendor + " " + global.userObj.username);
    console.log(req.session.user2+" "+req.session.username);
    var message = req.body.Message;
    console.log(message);


    var link=req.session.username+"_"+req.session.user2;
    var insertQuery = "INSERT INTO chat (from_user, to_user, message,chatlink) VALUES ('"+req.session.username+"','"+req.session.user2+"','"+message+"','"+link+"')";
    mysql.insertData(function (err, result) {
        if (result) {

            console.log("Result after insert"+result);

           // var string1 = global.userObj.username + "_" + global.vendor;
          //  var string2 =  global.vendor + "_" + global.userObj.username ;

        }

    }, insertQuery);

    console.log("--------------view posts -----");
    var  sess = req.session;
    if(sess.username) {
        var username = sess.username ;
        var community =sess.community;
        var userObj = {
            username: username,
            community: community
        };
        var getposts = "select username,title,description,imagepath,price,community from posts where username !='" + username + "'"+"AND access='true'";
        var posts = [];
        mysql.fetchData(function (err, result) {
            if (result.length > 0) {

                console.log("---------------posts found -----");
                for (var i = 0; i < result.length; i++) {
                    var post = {
                        title: result[i].title,
                        description: result[i].description,
                        path: result[i].imagepath,
                        username:result[i].username,
                        price:result[i].price,
                        community:result[i].community
                    }
                    console.log("---------------posts found -----" + post.title + post.description+post.username + post.path);
                    posts.push(post);
                }

            }
            console.log("---------------posts query dones -----");
            ejs.renderFile('./views/posts.ejs', {user: userObj, posts: posts}, function (err, result) {
                // if it is success
                if (!err) {
                    res.end(result);
                }
                //ERROR
                else {
                    res.end("ERROR OCCURED ");
                    console.log(err);
                }
            });

        }, getposts)
    }


}*/



/*function getmessages(req,res) {

    console.log(req.session.username);
    if(req.session.username){
        var user = req.session.username;
        console.log("logged in user: "+user);

        var sqlQuery = "select distinct from_user from chat where to_user = '"+user+"'";
        console.log(sqlQuery);

        mysql.fetchData(function (err,result) {
            if(err)
            {
                res.end("ERROR OCCURED ");
                console.log(err);
            } else if(result && result.length == 0 ){
                 ejs.renderFile('./views/messages.ejs', {result: []}, function (err, result) {
                    if (!err) {
                        res.end(result);
                    }
                    else {
                        res.end("ERROR OCCURED ");
                        console.log(err);
                    }
                });
            }

            else
            {
                console.log("---------------fectectd distinct users -----");
                console.log(result);
                 var allchats = [];
                 var sqlquery2 = "";
                for(i=0;i<result.length;i++){
                    console.log(result[i]);
                   // Select from_user, to_user, mesaage, date from chat where from_user = result [i].from_user  AND to_user = req.session.username order by idchat desc limit 1
                    sqlquery2 += "select idchat,from_user,to_user,message,created from chat where from_user ='" + result[i].from_user +"' AND to_user = '"+user+ "' order by idchat desc limit 1;";
                }

                mysql.fetchData(function (err,result) {
                    if(err)
                    {
                        res.end("ERROR OCCURED ");
                        console.log(err);
                    }else{
                        console.log("*****");
                        console.log(result);

                        console.log(result[0]);
                        for (var j = 0; j < result.length; j++) {
                            allchats[j] = (result[j][0]);
                        }
                        // allchats[i] = result[0];
                        ejs.renderFile('./views/messages.ejs', {result: allchats}, function (err, result) {
                            if (!err) {
                                res.end(result);
                            }
                            else {
                                res.end("ERROR OCCURED ");
                                console.log(err);
                            }
                        });
                    }
                }, sqlquery2);
            }
        },sqlQuery);


    }


} */
function getmessages(req,res) {

    console.log(req.session.username);
    if(req.session.username){
        var user = req.session.username;
        console.log("logged in user: "+user);

        var sqlQuery = "select distinct from_user from chat where to_user = '"+user+"'";
        console.log(sqlQuery);

        mysql.fetchData(function (err,result) {
            if(err)
            {
                res.end("ERROR OCCURED ");
                console.log(err);
            } else if(result && result.length == 0 ){
                ejs.renderFile('./views/messages.ejs', {result: []}, function (err, result) {
                    if (!err) {
                        res.end(result);
                    }
                    else {
                        res.end("ERROR OCCURED ");
                        console.log(err);
                    }
                });
            }

            else
            {
                console.log("---------------fectectd distinct users -----");
                console.log(result);
                var allchats = [];
                var sqlquery2 = "";
                for(i=0;i<result.length;i++){
                    // Select from_user, to_user, mesaage, date from chat where from_user = result [i].from_user  AND to_user = req.session.username order by idchat desc limit 1
                    sqlquery2 += "select idchat,from_user,to_user,message,created from chat where from_user ='" + result [i].from_user +"' AND to_user = '"+user+ "' order by idchat desc limit 1;";
                }

                mysql.fetchData(function (err,result) {
                    if(err)
                    {
                        res.end("ERROR OCCURED ");
                        console.log(err);
                    }else{
                        console.log("***");
                        console.log(result);
                        console.log("length:"+result.length);
                        for (var j = 0; j < result.length; j++) {

                            if(result.length>1)
                                allchats.push(result[j][0]);
                            else
                                allchats.push(result[j]);
                        }
                        // allchats[i] = result[0];
                        ejs.renderFile('./views/messages.ejs', {result: allchats}, function (err, result) {
                            if (!err) {
                                res.end(result);
                            }
                            else {
                                res.end("ERROR OCCURED ");
                                console.log(err);
                            }
                        });
                    }
                }, sqlquery2);
            }
        },sqlQuery);


    }


}

function replymessage(req,res) {
    var replyobject= req.params.i;
    console.log("ReplyObject: "+replyobject);
    var message = req.body.message;
    if(req.session.username){
        var user = req.session.username;
        console.log("logged in user: "+user);
        var sqlQuery = "select idchat,from_user,to_user,message,created from chat where to_user = '"+user+"' AND message_read = FALSE ";
        console.log(sqlQuery);

        mysql.fetchData(function (err,result) {
            if(err)
            {
                res.end("ERROR OCCURED ");
                console.log(err);
            }
            else
            {

                var x = req.params.i;
                x = x.replace(/:/, "");
                req.session.user2 = result[x].from_user;
                var id = result[x].idchat;
                var updatequery = "update chat set message_read = TRUE where idchat = "+ id;
                console.log(updatequery);
                mysql.fetchData(function (err,result) {
                    if(err){

                    }else{
                        var link=req.session.username+"_"+req.session.user2;
                        var insertQuery = "INSERT INTO chat (from_user, to_user, message,chatlink) VALUES ('"+req.session.username+"','"+req.session.user2+"','"+message+"','"+link+"')";
                        mysql.insertData(function (err, result) {
                            if (result) {

                                console.log("Result after insert"+result);

                                res.end("replied")

                            }

                        }, insertQuery);
                    }

                },updatequery);

            }
        },sqlQuery);


    }

}



//-- NOTE: No use time on insertChat.

exports.initiateemail=initiateemail;
exports.initiatechat=initiatechat;
exports.sendmessage=sendmessage;
exports.initiatechatbyfromandtouser=initiatechatbyfromandtouser;
exports.getmessages = getmessages;
exports.replymessage = replymessage;