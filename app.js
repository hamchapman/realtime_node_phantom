
/**
 * Module dependencies.
 */
require('newrelic');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var cronJob = require('cron').CronJob;
var phantom = require('node-phantom');

var app = express();

// all environments
app.set('port', process.env.PORT || 3030);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


new cronJob('*/5 * * * *', function(){
  phantom.create(function(err,ph) {
    return ph.createPage(function(err,page) {
      return page.open("http://realtime-benchmarking.herokuapp.com/js_latencies", function(err,status) {
        console.log("opened site? ", status);
        page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js', function(err) {
          //jQuery Loaded.
          // Waiting 30 seconds for tests to run before AJAX POST request is sent
          setTimeout(function() {
            return page.evaluate(function() {
                
            }, function(err,result) {
              console.log(result);
              ph.exit();
            });
          }, 30000);
        });
      });
    });
  });
  console.log('Cron every 5 minutes');
}, null, true);