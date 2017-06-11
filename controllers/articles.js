var fs = require("fs");
var mongojs = require("mongojs");
var config = require("./../db/config");
var render_file = function(file, resp){
    fs.readFile(file, function(err, data){
        resp.writeHead(200, {'Content-Type': 'text/html'});
        resp.write(data);
        resp.end();
    });
}

var db_url = config.mongodb_url;
var db_name = config.db_name;
var articles_coll = config.articles_collection;
var admins_coll = config.admins_collection;
var bots_coll = config.bots_collection;
var db_conn_str = db_url + "/" + db_name;

var COLOR_CODES = ["#FFE4B5", "#7FFFD4", "#0000FF", "#9400D3", "#800080", "#7CFC00", "", "", "", "", ""];

var generate_barchart1_data = function(distribution_data){
    var chart_data = [];
    var counter = 0;
    for(var usertype in distribution_data){
        var record = {
            type: 'column',
            title: usertype,
            fillStyle: COLOR_CODES[counter],
            data: distribution_data[usertype]
        }
        chart_data.push(record);
        counter += 1;
    }
    return chart_data;
}

var generate_peichart1_data = function(distribution_data){
    var chart_data = [];
    for(usertype in distribution_data){
        chart_data.push([usertype, distribution_data[usertype]]);
    }
    return chart_data;
}

module.exports.controller = function(app) {

    app.get('/',function(req,resp){
        render_file("views/index.html", resp);
    });

    app.get('/welcome', function(req, resp){
        render_file("views/welcome.html", resp);
    });

    app.get('/overall-stats', function(req, resp){
        render_file("views/overall-stats.html",resp);
    });

    app.get('/individual-stats', function(req, resp){
        render_file("views/individual-stats.html",resp);
    });

    app.get('/hello',function(req,res){
        res.end("hello");
    });

    app.get('/data/titles', function(req,resp){
        resp.writeHead(200, {'Content-Type': 'application/json'});
        var db = mongojs(db_conn_str, [articles_coll]);
        db.articles.find({},{"_id":1},function(err,docs){
            if(err) console.log(err);
            titles = [];
            for(var i in docs){
                titles.push(docs[i]._id);
            }
            resp.write(JSON.stringify(titles));
            resp.end();
        });
    });

    app.get('/data/overall-barchart', function(req, resp){
        resp.writeHead(200, {'Content-Type': 'application/json'});
        var data = {};
        var db = mongojs(db_conn_str, [articles_coll]);
        var pipeline = [
                        { "$project" : {"_id":"$_id", "no" :{"$size" : "$revisions"} } },
                        { "$sort" : {"no" : -1} },
                        { "$group" : {"_id":null, "max_article" : {"$first":"$_id"}, "min_article" : {"$last":"$_id"}}}
                       ];
        db.articles.aggregate(pipeline, function(err,docs){
            if(err) console.log(err);
            if(docs){
                console.log("Article with max no of revisions : " + docs[0]["max_article"]);
                console.log("Article with min no of revisions : " + docs[0]["min_article"]);
                data["The article with the most number of revisions"] = docs[0]["max_article"];
                data["The article with the least number of revisions"] = docs[0]["min_article"];
            }
            var pipeline = [
                            {"$unwind" : "$revisions"},
                            {"$project":{"_id":"$_id","usertype":"$revisions.usertype","user":"$revisions.user"}},
                            {"$match":{"usertype":{"$eq":"regular"}}},
                            {"$group": {"_id":"$_id", "user":{"$addToSet":"$user"}}},
                            {"$project" :{"_id":"$_id", "no" : {"$size":"$user"}}},
                            {"$sort":{"no":-1}}, 
                            {"$group": {"_id":null, "max_article":{"$first":"$_id"}, "min_article":{"$last":"$_id"}}}
                           ]
            db.articles.aggregate(pipeline, function(err,docs){
                if(err) console.log(err)
                if(docs){
                    console.log("Article with largest group of registered user: " + docs[0]["max_article"]);
                    console.log("Article with smallest group of registered user: " + docs[0]["min_article"]);
                    data["The article edited by largest group of registered users"] = docs[0]["max_article"]
                    data["The article edited by smallest group of registered users"] = docs[0]["min_article"]
                }
                var pipeline = [
                                {"$project":{"_id":"$_id", "timestamp":{"$min":"$revisions.timestamp"}}},
                                {"$sort":{"timestamp":1}},
                                {"$group":{"_id":null,"oldest_article":{"$first":"$_id"},"latest_article":{"$last":"$_id"}}}
                               ]
                var options = {"allowDiskUse":true}
                db.articles.aggregate(pipeline, options, function(err, docs){
                    if(err) console.log(err)
                    if(docs){
                        console.log("Article with longest history : " + docs[0]["oldest_article"]);
                        console.log("Article with smallest history : " + docs[0]["latest_article"]);
                        data["The article with the longest history"] = docs[0]["oldest_article"];
                        data["The article with the shortest history"] = docs[0]["latest_article"];
                    }
                    var pipeline = [
                                    {"$unwind":"$revisions"},
                                    {"$project":{"usertype":"$revisions.usertype","year":"$revisions.year"}},
                                    {"$group":{"_id":{"usertype":"$usertype","year":"$year"},"count":{"$sum":1}}},
                                    {"$sort":{"_id":1}}
                                   ];
                    db.articles.aggregate(pipeline, function(err,docs){
                        var usertypes_year_distribution = {}
                        var distribution_by_usertypes = {}
                        var barchart_dist_data = {}
                        var years = [];
                        if(err) console.log(err)
                        if(docs){
                            for(var i in docs){
                                var usertype = docs[i]._id.usertype
                                var year = docs[i]._id.year
                                if(years.indexOf(year) == -1){
                                    years.push(year)
                                }
                                if(!(usertype in usertypes_year_distribution))
                                    usertypes_year_distribution[usertype] = {}
                                usertypes_year_distribution[usertype][year] = docs[i].count
                                if(!(usertype in distribution_by_usertypes))
                                    distribution_by_usertypes[usertype] = 0
                                distribution_by_usertypes[usertype] = distribution_by_usertypes[usertype] + docs[i].count
                            }
                            years.sort();
                            for(usertype in usertypes_year_distribution){
                                if(!(usertype in barchart_dist_data))
                                    barchart_dist_data[usertype] = [];
                                for(var i in years){
                                    var count = 0;
                                    if(years[i] in usertypes_year_distribution[usertype])
                                        count = usertypes_year_distribution[usertype][years[i]];
                                    barchart_dist_data[usertype].push([years[i].toString(),count]);
                                }
                            }
                        }
                        var charts = {};
                        charts["barchart1"] = generate_barchart1_data(barchart_dist_data);
                        charts["piechart1"] = generate_peichart1_data(distribution_by_usertypes)
                        var result = {data : data, charts: charts};
                        console.log(JSON.stringify(result));
                        resp.write(JSON.stringify(result));
                        resp.end();
                    });
                });
            });
        });
    });

    app.get('/data/article', function(req,resp){
        resp.writeHead(200, {'Content-Type': 'application/json'});
        var data = {};
        var title = req.query.title;
        if(title == null || title == ""){
            resp.write(JSON.stringify({error:"Article title is not provided"}));
            resp.end();
            return;
        }
        var db = mongojs(db_conn_str, [articles_coll]);
        db.articles.find({"_id":title}, function(err, docs){
            data["The Title"] = title;
            if(err) console.log(err);
            if(docs){
                data["Total no of revisions"] = docs[0].revisions.length;
                //check if the article is upto date or not... if not, fetch recent revisions...
            }
            var pipeline = [
                            {"$match":{"_id":{"$eq":title}}},
                            {"$unwind":"$revisions"},
                            {"$project":{"user":"$revisions.user"}},
                            {"$group":{"_id":"$user","no":{"$sum":1}}},
                            {"$sort":{"no":-1}},
                            {"$limit":5}
                           ];
            db.articles.aggregate(pipeline, function(err, docs){
                var top_5_users = [];
                if(err) console.log(err);
                if(docs){
                    var top_5_users_data = [];
                    for(var i in docs){
                        var user = docs[i]._id;
                        var count = docs[i].no;
                        top_5_users.push(user);
                        var rec = '{"' + user + '":' + count  +' }';
                        top_5_users_data.push(JSON.parse(rec));
                    }
                    data["top-5-users"] = top_5_users_data;
                }
                var pipeline = [
                                {"$match" : {"_id" :{"$eq":title }}},
                                {"$unwind":"$revisions"},
                                {"$project":{"usertype":"$revisions.usertype","year":"$revisions.year"}},
                                {"$group":{"_id":{"usertype":"$usertype","year":"$year"},"count":{"$sum":1}}},
                                {"$sort":{"_id":1}}
                               ];
                db.articles.aggregate(pipeline, function(err, docs){
                    var usertypes_year_distribution = {};
                    var distribution_by_usertypes = {};
                    var barchart_dist_data = {};
                    var years = [];
                    if(err) console.log(err); 
                    if(docs){
                        for(var i in docs){
                            var usertype = docs[i]._id.usertype
                            var year = docs[i]._id.year
                            if(years.indexOf(year) == -1){
                                years.push(year)
                            }
                            if(!(usertype in usertypes_year_distribution))
                                usertypes_year_distribution[usertype] = {}
                            usertypes_year_distribution[usertype][year] = docs[i].count
                            if(!(usertype in distribution_by_usertypes))
                                distribution_by_usertypes[usertype] = 0
                            distribution_by_usertypes[usertype] = distribution_by_usertypes[usertype] + docs[i].count
                        }
                        years.sort();
                        for(usertype in usertypes_year_distribution){
                            if(!(usertype in barchart_dist_data))
                                barchart_dist_data[usertype] = [];
                            for(var i in years){
                                var count = 0;
                                if(years[i] in usertypes_year_distribution[usertype])
                                    count = usertypes_year_distribution[usertype][years[i]];
                                barchart_dist_data[usertype].push([years[i].toString(),count]);
                            }
                        }
                    }
                    var charts = {};
                    charts["barchart1"] = generate_barchart1_data(barchart_dist_data);
                    charts["piechart1"] = generate_peichart1_data(distribution_by_usertypes);

                    var pipeline = [
                                    {"$unwind":"$revisions"},
                                    {"$project":{"_id":"$_id", "user":"$revisions.user", "year":"$revisions.year"}},
                                    {"$match":{"user":{"$in":top_5_users}}},
                                    {"$group":{"_id":{"user":"$user","year":"$year"},"count":{"$sum":1}}}
                                   ];
                    db.articles.aggregate(pipeline, function(err,docs){
                        if(err) console.log(err);
                        if(docs){
                            var distribution_by_users_year_wise = {}
                            var barchart_dist_data = {}
                            var user_year_wise_dist_data = {};
                            var years =  [];
                            for(var i in docs){
                                var doc = docs[i];
                                var user = doc._id.user;
                                var year = doc._id.year;
                                var count = doc.count;
                                if(years.indexOf(year) == -1) years.push(year);
                                if(!(user in distribution_by_users_year_wise))
                                    distribution_by_users_year_wise[user] = {}
                                distribution_by_users_year_wise[user][year] = count;
                            }
                            years.sort();
                            for(var user in distribution_by_users_year_wise){
                                if(!(user in barchart_dist_data))
                                    barchart_dist_data[user] = []
                                if(!(user in user_year_wise_dist_data))
                                    user_year_wise_dist_data[user] = []
                                for(var i in years){
                                    var count = 0;
                                    if(years[i] in distribution_by_users_year_wise[user])
                                        count = distribution_by_users_year_wise[user][years[i]]
                                    barchart_dist_data[user].push([years[i].toString(), count]);
                                    if(count != 0)
                                        user_year_wise_dist_data[user].push([years[i].toString(), count]);
                                }
                            }
                            console.log(user_year_wise_dist_data);
                        }
                        charts["barchart2"] = user_year_wise_dist_data;
                        charts["barchart3"] = generate_barchart1_data(barchart_dist_data);
                        var result = {data : data, charts: charts};
                        console.log(JSON.stringify(result));
                        resp.write(JSON.stringify(result));
                        resp.end();
                    });

                });
            });
        });
    });
}
