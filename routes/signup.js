var ejs = require("ejs");
var mysql = require('./mysql');
var AWS = require('aws-sdk');
var fs = require('fs');

AWS.config.update({
    accessKeyId: "xxxx",
    secretAccessKey: "yyyy",
    region:'xxxx',
    sslEnabled: true,
});

function signup(req,res)
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
            ejs.renderFile('./views/signup.ejs',{out:out},function(err,result){
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
function postadd(req,res)
{
    console.log("In postadd Function");


    var sess =  req.session;
    if(sess.username && sess.community){
        var title = req.body.Title;
        var description = req.body.Description;
        var othercommunity = req.body.OtherCommunity;
        var path = "xxxxxxxx/"+req.file.originalname;
        console.log("session active "+sess.username+title+description+path+"Other Community:"+othercommunity+"end");
        var access = true;

        if(othercommunity){
            var sns = new AWS.SNS();

            var payload = title+" By: "+sess.username+" Please contact if interested: "+sess.email;


            // first have to stringify the inner APNS object...
           // payload.APNS = JSON.stringify(payload.APNS);
            // then have to stringify the entire message payload
             payload = JSON.stringify(payload);

          /*  if(sess.community == 'ALAMEDA'){

                arn = 'xxxx'

            }
            else{
                arn = 'yyyy'
            } */

            console.log('sending push');
            sns.publish({
                Message: payload,
                MessageStructure: 'string',
                TargetArn: 'xxxxx'
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
            Bucket:'xxxx',
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
        var storepost = "insert into posts (username,imagepath,title,description,access,community) values ('"+sess.username+"','"+path+"','"+title+"','"+description+"','true','"+sess.community+"' )";
        mysql.fetchData(function (err,result) {
            if(err)
            {
                res.end("ERROR OCCURED ");
                console.log(err);
            }
            else
            {

                console.log("---------------in stored post completed -----");


            }
        },storepost);

    }
     res.end("Done!!");


}

exports.signup=signup;
exports.storeuserdetails = storeuserdetails;
exports.postadd = postadd;

