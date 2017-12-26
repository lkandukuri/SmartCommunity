var ejs = require("ejs");
var mysql = require('./mysql');
var login = require('./login');

function viewposts(req,res){

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

}


function deletePost(req,res)
{
    console.log("In postDelete Function");
    console.log("iiiiiiii------"+req.params.i);
    var sess =  req.session;



    if(sess.username && sess.community){

        var username = sess.username ;
        var community =sess.community;
        var userObj = {
            username: username,
            community: community
        };

        var getposts = "select id,username,title,description,imagepath from posts where username ='" + username + "'"+"AND community="+"'"+community+"'";
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

                var sqlQuery = "delete from posts where id='"+posts[x].id+"'";
                console.log(sqlQuery);
                mysql.deleteData(function (err,result) {
                    if(err)
                    {
                        res.end("ERROR OCCURED ");
                        console.log(err);
                    }
                    else
                    {
                        console.log("---------------in stored post completed -----");
                        //res.end("Done!!");
                        login.renderHome(req,res);

                    }
                },sqlQuery);
            }


        }, getposts);


    }
}
exports.viewposts=viewposts;
exports.deletePost=deletePost;