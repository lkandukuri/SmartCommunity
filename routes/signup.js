var ejs = require("ejs");
var mysql = require('./mysql');
var AWS = require('aws-sdk');
var fs = require('fs');
var login =  require('./login');

AWS.config.update({
    accessKeyId: "AKIAIHRIILOILOENQVFA",
    secretAccessKey: "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",
    region:'us-west-2',
    sslEnabled: true,
});

function signup(req,res, messages)
{
    console.log("In signup Function");
    var out = [];
    var getcommunities="select community from communities";

    mysql.fetchData(function (err,result) {
        if(err)
        {
            throw err;
        }
        else
        {

                console.log("---------SUCCESFULLY GOT FROM communities-------");
            if(result.length>0) {
                 //console.log(result.length);
                for (var i = 0; i < result.length; i++) {
                    console.log(result[i].community);
                    out.push(result[i].community);
                }

            };
            console.log("---------SUCCESFULLY GOT FROM communities-------" + out[0]+out[1]);
            ejs.renderFile('./views/signup.ejs',{
                out:out,
                messages: messages
            },function(err,result){
                // if it is success
                if(!err)
                {
                    res.end(result);
                }
                //ERROR
                else
                {
                    res.end("ERROR OCCURED ");
                    console.log(err);
                }
            });
        }
    },getcommunities);


}

function storeuserdetails(req,res)
{
    console.log("In signup Function");
    var username= req.body.username;
    var password= req.body.password;
    var email = req.body.email;
    var community = req.body.community;
    var userObj = {
        username: username,
        community: community
    };


    var findUser = "select * from users where username='"+username+"';";
    mysql.fetchData(function (err,result) {
        if(err)
        {
            res.end("ERROR OCCURED ");
            console.log(err);
        }
        else if (result && result.length > 0) {
            console.log("---------User exists-------");
            signup(req, res, ["Username already exists, try using a different username!"]);
        } else {
            var sess;
            console.log("values of user are "+username+password+community+email);
            var storeuser = "insert into users (username,email,password,community) values ('"+username+"','"+email+"','"+password+"','"+community+"' )";
            mysql.fetchData(function (err,result) {
                if(err)
                {
                    res.end("ERROR OCCURED ");
                    console.log(err);
                }
                else
                {
                    sess = req.session;
                    sess.username=username;
                    sess.community=community;
                    sess.email = email;

                    var userObj = {
                        username: username,
                        isAdmin: 0,
                        community: community
                    };
                    global.userObj = userObj;

                    var posts =[]
                    console.log("---------------in stored userdetails -----");
                    ejs.renderFile('./views/profile.ejs',{user:userObj,posts:posts},function(err,result){
                        // if it is success
                        if(!err)
                        {
                            res.end(result);
                        }
                        //ERROR
                        else
                        {
                            res.end("ERROR OCCURED ");
                            console.log(err);
                        }
                    });
                }
            },storeuser);
        }
    },findUser);
}

function postadd(req,res) {
    console.log("In postadd Function");

    var sess =  req.session;
    if(sess.username && sess.community){
        var title = req.body.Title;
        var price = req.body.Price;
        var description = req.body.Description;
        var othercommunity = req.body.OtherCommunity;
        var path = "https://s3-us-west-2.amazonaws.com/edu.sjsu.cmpe281.project/"+req.file.originalname;
        console.log("session active "+sess.username+title+description+path+"Other Community:"+othercommunity+"end");
        var access;
        if( othercommunity == "OtherCommunity")
            access = true;
        else
            access = false;

        if(othercommunity){
            var sns = new AWS.SNS();

            var payload = title+" By: "+sess.username+" Please contact if interested: "+sess.email;
            // first have to stringify the inner APNS object...
           // payload.APNS = JSON.stringify(payload.APNS);
            // then have to stringify the entire message payload
             payload = JSON.stringify(payload);
             var topic;
             if(req.session.community == "AVALON"){
                 topic = 'arn:aws:sns:us-west-2:390872976456:ALAMEDA'

             }else{
                 topic = 'arn:aws:sns:us-west-2:390872976456:AVALON'
             }

            console.log('sending push');
            sns.publish({
                Message: payload,
                MessageStructure: 'string',
                TargetArn: topic
               }, function(err, data) {
                if (err) {
                    console.log(err.stack);
                    return;
                }

                console.log('push sent');
                console.log(data);
                });

        }

        var fileStream = fs.createReadStream("./public/images/"+req.file.originalname);
        var s3 = new AWS.S3();
        s3.putObject({
            Bucket:'edu.sjsu.cmpe281.project',
            Key: req.file.originalname,
            Body: fileStream,
            ContentType:'image/jpeg',
            ACL: 'public-read',
        }, function(err, data){
            if(err){
                console.log("------Image Upload error--------");
                };
            console.log('--- Image Uploaded -- ');

        });
        var storepost = "insert into posts (username,imagepath,title,description,access,community,price) values ('"+sess.username+"','"+path+"','"+title+"','"+description+"','"+access+"','"+sess.community+"','"+price+"' )";
        mysql.fetchData(function (err,result) {
            if(err)
            {
                res.end("ERROR OCCURED ");
                console.log(err);
            }
            else
            {
                console.log("---------------in stored post completed -----");
                var userObj = global.userObj;
                var getposts="select title,description,imagepath,price from posts where username ='"+userObj.username+"'";
                var posts =[];
                mysql.fetchData(function (err,result) {
                    if(result.length> 0){

                        console.log("---------------posts found -----");
                        for (var i = 0; i < result.length; i++) {
                            var post ={
                                title:result[i].title,
                                description: result[i].description,
                                path: result[i].imagepath,
                                price: result[i].price

                            }
                            console.log("---------------posts found -----"+post.title+post.description+post.path);
                            posts.push(post);
                        }

                    }
                    console.log("---------------posts query dones -----");
                    ejs.renderFile('./views/profile.ejs',{user:userObj,posts:posts},function(err,result){
                        // if it is success
                        if(!err)
                        {
                            res.end(result);
                        }
                        //ERROR
                        else
                        {
                            res.end("ERROR OCCURED ");
                            console.log(err);
                        }
                    });

                },getposts)

            }
        },storepost);
    }


}

exports.signup=signup;
exports.storeuserdetails = storeuserdetails;
exports.postadd = postadd;

