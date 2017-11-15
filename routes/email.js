var ejs = require("ejs");
var mysql = require('./mysql');
var AWS = require('aws-sdk');


AWS.config.update({
    accessKeyId: "xxxxxx",
    secretAccessKey: "xxxxx",
    region:'xxxx',
    sslEnabled: true,
});


function initiateemail(req,res) {

    var owner= req.body.owner;
    if(req.session.username){
        var user = req.session.username


        console.log("---------Initiate email between "+ user + "  " + owner+"--------------");

        // load AWS SES
        var ses = new AWS.SES({apiVersion: '2010-12-01'});

     /*  var getemail= "select email from users where username ='"+owner+"'";

        mysql.fetchData(function (err,result) {
            if(err)
            {
                res.end("ERROR OCCURED ");
                console.log(err);
            }
            else
            {
                console.log("---------------get email query succesful -----");
                if(result.length ==1){
                    console.log("---------------email found -----");

                    toemail = result[0].email;


                    var to = [toemail]


                    var from = req.session.email



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
        },getemail); */






        var to = ['xxxxx']


        var from = 'yyyyy'



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

}


exports.initiateemail=initiateemail;