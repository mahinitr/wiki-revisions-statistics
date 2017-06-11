# Project's READ
Introduction:
This is a web application built on Node.js framework and it uses Html, Css and Jquery for user interface.
This app read the data of wiki articles' revisions from MongoDB, processes in the backend and shows the statistics on the UI.
Node version: 6.10.3, Npm version: 3.10.10.
Running the app:
0. Before running the app, the data needs to be migrated from the data sets files. Reads steps in db/import_data.js
1. Open the terminal and clone the repository onto the local machine or where ever you want to run it.
"git clone https://mahinitr@bitbucket.org/mahinitr/wiki-articles-revisions.git"
2. cd to folder wiki-articles-revisions.
3. Run "source env/bin/activate" to activate the environment.
4. Then run: "node app.js" to start the app.
5. Then open the URL "http://localhost:3000" in browser to access the UI.(If you cloned the code to VM, you can give the VM name instead of localhost).
