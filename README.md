# Wiki Articles Revisions - Project

This is a web application built on Node.js framework and it uses Html, Css and Jquery for user interface.
This app read the data of wiki articles' revisions from MongoDB, processes in the backend and shows the statistics on the UI.
Node version: 6.10.3, Npm version: 3.10.10.

## Prerequisites for running:
### Note: This is develoepd and tested on ubuntu. Hence, I recommend running the app on ubuntu, you can try running on other platforms and resolving the issues that you face.(or contact me @ mahi.nitr@gmail.com)
1. Please clone the repository. "git clone https://mahinitr@bitbucket.org/mahinitr/wiki-articles-revisions.git"
2. Technologies requried - node.js and some of its modules, mongodb server and python(optional).
Installing node.js:
*. To install nodejs, follow the steps documented at https://nodejs.org/en/download/package-manager/ (Look for ubuntu section)
And then, install nodejs modules using the command : npm intall express body-parser mongojs method-override async
*. If you don't have any mongodb server running, you can install it locally  using https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
*. Once you have the mongodb server details, please update them in db/config.js file.
*. If importing dataset using nodejs is not working on your system, you can python to do this job. For this, you need python & and its modules :pymongo (Please check point#1 in the section "Running the app" below)

3. Dataset to be downloaded from https://drive.google.com/drive/folders/0B4tbRUEi5bZfNU5kMENnN3RRTjA. The dataset contains 3 things (1. revisions folder, admin.txt and bot.txt)
These 3 things should be kept in a folder any where on your system (Ex: /home/mahesh/ )and give a name to it (Ex: /home/mahesh/wiki-data)
Please edit the file db/config.json, update the dataset_path as this path. (Ex: dataset_path = '/home/mahesh/wiki-data')

## Running the app:
1. There are two ways of importing the dataset into mongodb. 1. Using node script, 2. Using python script.
The data needs to be migrated from the dataset files. Run: node db/import_data.js 
If import_data.js is not working on your OS, please run db/load_data.py, before running, you need to update the datasets path and mongoDB details in the load_data.py file)
2. cd to folder wiki-articles-revisions.
3. Make sure you have the node installed on your system.
4. Then run: "node app.js <port>" to start the app. Ex: node app.js 3000
5. Then open the URL "http://<server_hostname>:<port>"(Ex: http://localhost:3000) in browser to access the UI.(If you cloned the code to VM, you can give the VM name instead of localhost).

##Contact:
If you need any help running the app, please contact me @ mahi.nitr@gmail.com
