/*
1. Please provide the correct mongobd_url, dataset_path, revisions_dir, admin_file, biot_file below.
2. DB  and collections will be created automatically.
3. Finalize the database name and collections' names and assign them to the below variables
*/

var mongodb_url = "localhost"; //db hostname or ip address or URL
var dataset_path = "./data"; // Path for the data sets to load. This should contain the revisions folder, admin.txt & bot.txt files.
var revisions_dir = "revisions";
var amdin_file = "admin.txt"
var bot_file = "bot.txt";

var db_name ='wiki'; //database name
var articles_collection = "articles"; // DB collection for articles
var admins_collection = "admins"; // DB collection for admins
var bots_collection = "bots"; // DB collection for bots
var nspath = require('path');

exports.mongodb_url = mongodb_url;
exports.db_name = db_name;
exports.articles_collection = articles_collection;
exports.admins_collection = admins_collection;
exports.bots_collection = bots_collection;
exports.dataset_path = nspath.join(dataset_path, revisions_dir);
exports.admin_path = nspath.join(dataset_path, amdin_file)
exports.bot_path = nspath.join(dataset_path, bot_file);
