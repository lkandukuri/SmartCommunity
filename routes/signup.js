var ejs = require("ejs");
var mysql = require('./mysql');

function signup(req,res)
{
    console.log("In signup Function");
    var out = [];
    let getcommunities="select community from communities";
    mysql.fetchData(function (err,result) {
        if(err)
        {
            throw err;
            /*console.log("error thrown");*/
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
            ejs.renderFile('./views/signup.ejs',{out:out,out1:out[0]},function(err,result){
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
        community: community,
        email: email
    };
    var sess;
    console.log("values of user are "+username+password+email+community);
    var storeuser = "insert into users (username,password,community,email) values ('"+username+"','"+password+"','"+community+"','"+email+"' )";
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
            sess.email=email;

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
        var path = "images/"+req.file.originalname;
        console.log("session active "+sess.username+title+description+path);
        var access = true;
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

