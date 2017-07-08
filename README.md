# Project's READ
Introduction:
This is a web application built on Node.js framework and it uses Html, Css and Jquery for user interface.
This app read the data of wiki articles' revisions from MongoDB, processes in the backend and shows the statistics on the UI.
Node version: 6.10.3, Npm version: 3.10.10.
The requirements, dataset, documentation are avaible at https://drive.google.com/drive/folders/0B4tbRUEi5bZfNU5kMENnN3RRTjA
Running the app:
1. Before running the app, the data needs to be migrated from the dataset files. Reads steps in db/import_data.js
(If node.js is not working for you, please run db/load_data.py)
2. Open the terminal and clone the repository onto the local machine or where ever you want to run it.
"git clone https://mahinitr@bitbucket.org/mahinitr/wiki-articles-revisions.git"
3. cd to folder wiki-articles-revisions.
4. Make sure you have the node installed on your system.
5. Then run: "node app.js" to start the app.
6. Then open the URL "http://localhost:3000" in browser to access the UI.(If you cloned the code to VM, you can give the VM name instead of localhost).
