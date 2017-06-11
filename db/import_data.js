/*
Steps to to load the import data.
1. Have mongodb setup ready and create a database 'wikirevisions'
2. Edit the file config.js under db folder
3. Change the variables'values to appropriate values
4. Then run : node import_data.js

*/
var fs = require('fs');
var async = require('async');
var config=require('./config.js');
var mongojs = require('mongojs');
var nspath = require("path");

var db_url = config.mongodb_url;
var db_name = config.db_name;
var articles_coll = config.articles_collection;
var admins_coll = config.admins_collection;
var bots_coll = config.bots_collection;
var dataset_path=config.dataset_path;
var admin_path=config.admin_path;
var bot_path=config.bot_path;

var db_conn_str = db_url + "/" + db_name;

var insert_revision = function(bulk, rev_obj,callback){
    callback(null);
};



console.log("Importing the data to db " + db_conn_str);
var load_articles_revisions = function(admins, bots, callback){
    console.log("Loading the revisions from dataset_path");
    fs.readdir(dataset_path, function(err, files) {
        if(err) {console.log(err); return; }
        var db = mongojs(db_conn_str, [articles_coll]);
        for (var i=0; i< files.length; i++)
        {
            var path_1= nspath.join(dataset_path, files[i]);
            fs.readFile(path_1, 'utf8', function (err, data) {
                if (err) {console.log(err); return;}
                var json = JSON.parse(data);
                id=json[0].title;
                var revisions = [];
                min_timestamp = new Date(json[0].timestamp).getTime();
                max_timestamp = new Date(json[0].timestamp).getTime();
                for(j=0;j<json.length;j++)
                {
                    var usertype = "regular";
                    if('anon' in json[j]){
                        usertype = "anon";
                    }
                    else if(bots.indexOf(json[j].user) >= 0){
                        usertype = "bot"
                    }
                    else if(admins.indexOf(json[j].user) >= 0){
                        usertype = "admin";
                    }
                    var dt = new Date(json[j].timestamp);
                    rev_obj = json[j]
                    rev_obj['time'] = dt.getTime()
                    rev_obj['year'] = dt.getUTCFullYear();
                    rev_obj['usertype'] = usertype;
                    revisions.push(rev_obj);
                    if(dt.getTime() < min_timestamp)
                        min_timestamp = dt.getTime();
                    else if(dt.getTime() > max_timestamp)
                        max_timestamp = dt.getTime();
                }
                var y={
                    '_id' : id,
                    'first_rev_timestamp' : min_timestamp,
                    'recent_rev_timestamp' : max_timestamp,
                    'revisions' : revisions
                };
                db.articles.insert(y, function(err, doc) {
                    if(err) console.log(err);
                    db.close();
                });
            });
        }
    });
};

var load_admins = function(callback){
    console.log("loading admins from " + admin_path);
    fs.readFile(admin_path, function(err, data) {
        if(err) {console.log(err); return;}
        var db = mongojs(db_conn_str, [admins_coll]);
        var bulk = db.admins.initializeOrderedBulkOp();
        var arr = data.toString().split("\n");
        var c = 0;
        arr.forEach(function(d,i){
            var doc = {"_id" : d};
            bulk.insert(doc);
            c = c + 1;
            if(c == arr.length){
                bulk.execute(function(err,res){
                    if(err) console.log(err);
                    console.log("finished loading admins");
                    db.close();
                    callback(null, arr);
                });
            }
        });
    });

}


var load_bots = function(admins, callback){
    console.log("loading bots from " + bot_path);
    fs.readFile(bot_path, function(err, data) {
        if(err) { console.log(err); return; }
        var db = mongojs(db_conn_str, [bots_coll]);
        var bulk = db.bots.initializeOrderedBulkOp();
        var arr = data.toString().split("\n");
        var c = 0;
        arr.forEach(function(d,i){
            var doc = {"_id" : d};
            bulk.insert(doc);
            c = c + 1;
            if(c == arr.length){
                bulk.execute(function(err,res){
                    if(err) console.log(err);
                    console.log("finished loading bots");
                    db.close();
                    callback(null, admins, arr);
                });
            }
        });
    });
}
async.waterfall([load_admins, load_bots, load_articles_revisions], function(err, res){

});

