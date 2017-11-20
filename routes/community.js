var ejs = require("ejs");
var mysql = require('./mysql');
var login = require('./login');

function createCommunity(req,res) {
    console.log("--------------createCommunity -----");
    var  sess = req.session;
    if(sess.username) {
        var username = sess.username ;
        var community =sess.community;
        var userObj = {
            username: username,
            community: community
        };

        const newCommunity = req.body.newCommunity;
        const findCommunityQuery = "select community from communities where community='"+newCommunity+"'";
        const insertCommunityQuery = "INSERT INTO communities (community) VALUES ('"+newCommunity+"')";
        mysql.fetchData(function(err, result) {
            if (err) {
                login.navigateToAdminScreen(userObj, res, "Error occured");
            } else if (result && result.length == 0) {
                mysql.fetchData(function(err, result) {
                    if (err) {
                        login.navigateToAdminScreen(userObj, res, "Error occured in insertCommunityQuery");
                    }
                    login.navigateToAdminScreen(userObj, res, "Created");
                }, insertCommunityQuery);
            } else {
                login.navigateToAdminScreen(userObj, res, "Duplicate community");
            }
        }, findCommunityQuery);
    }
}

function updateCommunity(req, res) {
    console.log("--------------updateCommunity -----");
    const oldCommunity = req.body.oldCommunity;
    const newCommunity = req.body.newCommunity;

    var  sess = req.session;
    if(sess.username) {
        var username = sess.username ;
        var community =sess.community;
        var userObj = {
            username: username,
            community: community
        };
    }

    const updateCommunityQuery = "UPDATE communities SET community = '"+newCommunity+"' WHERE community='"+oldCommunity+"';";

    mysql.fetchData(function(err, result) {
        if (err) {
            res.end("ERROR OCCURED in updateCommunity");
            console.log(err);
            return err;
        }
        console.log("Updated");
        login.navigateToAdminScreen(userObj, res, "Updated");
    }, updateCommunityQuery);
}

function deleteCommunity(req, res) {
    console.log("--------------deleteCommunity -----");
    var  sess = req.session;
    if(sess.username) {
        var username = sess.username ;
        const community =sess.community;
        var userObj = {
            username: username,
            community: community
        };
    }
    
    const community = req.body.community;
    const deleteCommunityQuery = "delete from communities where community='"+community+"'";

    mysql.fetchData(function(err, result) {
        if (err) {
            res.end("ERROR OCCURED in updateCommunity");
            console.log(err);
            return err;
        }
        console.log("deleted");
        login.navigateToAdminScreen(userObj, res, "Deleted");
    }, deleteCommunityQuery);
}

function deleteUser(req, res) {
    var  sess = req.session;
    if(sess.username) {
        const username = sess.username ;
        const community =sess.community;
        var userObj = {
            username: username,
            community: community
        };
    }
    
    const username = req.body.username;
    const deleteUserQuery = "delete from users where username='"+username+"'";

    mysql.fetchData(function(err, result) {
        if (err) {
            res.end("ERROR OCCURED in deleteUser");
            console.log(err);
            return err;
        }
        console.log("deleted");
        login.navigateToAdminScreen(userObj, res, "Deleted");
    }, deleteUserQuery);
}

exports.createCommunity = createCommunity;
exports.updateCommunity = updateCommunity;
exports.deleteCommunity = deleteCommunity;
exports.deleteUser = deleteUser;