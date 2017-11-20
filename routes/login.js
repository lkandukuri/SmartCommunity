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
function postlogin(req,res){
    var username= req.body.username;
    var password= req.body.password;
    var isAdmin = 0;
    var sess;

    var getuser="select community, is_admin from users where username ='"+username+"'"+"AND password="+"'"+password+"'";
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
                console.log("---------------user found -----");
                sess = req.session;
                sess.username=username;
                sess.community=result[0].community;
                sess.isAdmin = result[0].is_admin;

                isAdmin = result[0].is_admin;
                var userObj = {
                    username: username,
                    isAdmin: isAdmin,
                    community: result[0].community
                };

                if (isAdmin) {
                    navigateToAdminScreen(userObj, res);
                } else {
                    var getposts="select title,description,imagepath from posts where username ='"+username+"'";
                    var posts =[];
                    mysql.fetchData(function (err,result) {
                        if(result.length> 0){

                            console.log("---------------posts found -----");
                            for (var i = 0; i < result.length; i++) {
                                var post ={
                                    title:result[i].title,
                                    description: result[i].description,
                                    path: "./"+result[i].imagepath

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
            }
            else{
                res.end("No user Found!!")
            }



        }
    },getuser);
}

function navigateToAdminScreen(userObj, res, errorMessage) {
    let getusers="select username,email, community from users where is_admin ='0';";
    let getcommunities="select community from communities;";
    const queryString = getusers + getcommunities;

    
    mysql.fetchData(function (err,result) {

        var nonadminusers =[];
        if(result.length> 0 && result[0].length> 0){
            console.log("---------------admin page found -----");
            for (var i = 0; i < result[0].length; i++) {
                var userinfo ={
                    username:result[0][i].username,
                    email: result[0][i].email,
                    community: result[0][i].community
                }
                console.log("---------------admin page found -----"+userinfo.username+userinfo.email);
                nonadminusers.push(userinfo);
            }
        }

        const communities = [];
        if(result.length > 1 && result[1].length> 0) {
            for (var j = 0; j < result[1].length; j++) {
                communities.push(result[1][j].community);
            }
        }
        console.log("---------------posts query dones -----");

        ejs.renderFile('./views/admin.ejs',{
            user: userObj,
            users: nonadminusers,
            communities: communities,
            errorMessage: errorMessage
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
    }, queryString);
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
exports.navigateToAdminScreen = navigateToAdminScreen;
exports.postlogin = postlogin;
exports.logout = logout;
