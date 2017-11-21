var ejs = require("ejs");
var mysql = require('./mysql');

function login(req,res)
{
    ejs.renderFile('./views/login.ejs',function(err,result){
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

function renderHome(req,res){
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
                    price:result[i].price

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

function postlogin(req,res){
    var username= req.body.username;
    var password= req.body.password;

    var sess;

    var getuser="select community from users where username ='"+username+"'"+"AND password="+"'"+password+"'";

    mysql.fetchData(function (err,result) {
        if(err)
        {
            res.end("ERROR OCCURED ");
            console.log(err);
        }
        else
        {
            console.log("---------------get user query succesful -----");
            if(result.length ==1){
                console.log("--------user found -----");
                sess = req.session;
                sess.username=username;
                sess.community=result[0].community;
                var userObj = {
                    username: username,
                    community: result[0].community
                };
                var getposts="select title,description,imagepath,price from posts where username ='"+username+"'";
                var posts =[];
                mysql.fetchData(function (err,result) {
                    if(result.length> 0){

                        console.log("---------------posts found -----");
                        for (var i = 0; i < result.length; i++) {
                            var post ={
                                title:result[i].title,
                                description: result[i].description,
                                path: result[i].imagepath,
                                price:result[i].price
                            }
                            console.log("---------------posts found -----"+post.title+post.description+post.path);
                            posts.push(post);
                        }

                    }
                    console.log("---------------posts query dones -----");
                    global.userObj= userObj;
                    global.posts = posts;
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
            else{
                res.end("No user Found!!")
            }



        }
    },getuser);
}

function logout (req,res) {

    req.session.destroy();
    ejs.renderFile('./views/index.ejs',function(err,result){
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

exports.login=login;
exports.postlogin = postlogin;
exports.logout = logout;
exports.renderHome = renderHome;