# Developer: Mahesh
var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();
var server = http.createServer(app);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
//app.use(session());
//app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})


fs.readdirSync('./controllers').forEach(function (file){
    if(file.substr(-3) == '.js') {
        route = require('./controllers/' + file);
        route.controller(app);
    }
});

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
