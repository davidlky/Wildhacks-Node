var express         =       require("express");
var multer          =       require('multer');
var bodyParser          =       require('body-parser');
var app             =       express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like bellow.
app.use(bodyParser.urlencoded({ extended: true }));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '-' + Date.now()+"."+file.mimetype.substring(file.mimetype.indexOf("/")+1));
  }
});

var mysql1      = require('mysql');

var connection = mysql1.createConnection({
  host     : 'us-cdbr-iron-east-03.cleardb.net',
  user     : 'bfc424aa3641a8',
  password : 'da5493e1',
  database: "ad_c498c65dd12bd80"
});

var upload      =   multer({ storage:storage});
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post('/fileupload', upload.single('photo'), function (req, res, next) {
    var post  = {EventID: req.body.eventID, UserID:req.body.userID, ImageURL: req.file.filename};
    var query = connection.query('INSERT INTO HISTORY SET ?', post, function(err, result) {
            res.send(result);
        });
});

app.get('/files/:id', function (req, res, next) {
    var query = connection.query('SELECT *  from HISTORY where EventID='+connection.escape(req.params.id), function(err, result) {

            res.send(result);
        });
});

app.get('/files', function (req, res, next) {
    var query = connection.query('SELECT *  from HISTORY', function(err, result) {
          res.send(result);
        });
});



app.get('/events/:id', function (req, res) {
    var sql    = 'SELECT * FROM event WHERE EventID = ' + connection.escape(req.params.id);
    var query = connection.query(sql, function(err, result) {
          res.send(result);
        });
});


app.get('/events/', function (req, res) {
    var sql    = 'SELECT * FROM event';
    var query = connection.query(sql, function(err, result) {
          res.send(result);
        });
});

app.get('/addevent', function (req, res) {
  res.sendFile(__dirname + "/views/events/add.html");
});

app.post('/addevent', function (req, res) {
    var post  = {name: req.body.name, details:req.body.description, location : req.body.location};
    var query = connection.query('INSERT INTO EVENT SET ?', post, function(err, result) {
          res.send(result);
        });
});


// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
    var port = (process.env.VCAP_APP_PORT || 3000);
    var host = (process.env.VCAP_APP_HOST || 'localhost');
    // print a message when the server starts listening
  console.log("server starting on " + port + host);

connection.connect();

var query = connection.query("DROP TABLE HISTORY", function(err, result) {
      console.log(result);
    });

var query = connection.query("DROP TABLE event", function(err, result) {
      console.log(result);
    });

var query = connection.query("CREATE TABLE EVENT (EventID int NOT NULL AUTO_INCREMENT, Name varchar(255) NOT NULL, details varchar(500), location varchar(255), PRIMARY KEY (EventID));", function(err, result) {
      console.log(result);
    });

var query = connection.query("CREATE TABLE HISTORY (ImageID int NOT NULL AUTO_INCREMENT, ImageURL varchar(255) NOT NULL, EventID Integer, UserID varchar(255), Timestamp TIMESTAMP, PRIMARY KEY (ImageID));", function(err, result) {
      console.log(result);
    });
});