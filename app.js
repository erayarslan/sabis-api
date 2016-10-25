var cache = require(__dirname + '/cache');
var sabis = require(__dirname + '/sabis');

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var getUser = function (username, password, next) {
  if (cache.exist(username, password)) {
    next(null, cache.get(username, password))
  } else {
    sabis.doLogin(username, password, function (e, user) {
      if (!e) {
        cache.set(username, password, user);
        next(null, cache.get(username, password));
      } else {
        next(e, null);
      }
    });
  }
};

app.post('/', function (req, res) {
  var username = req.body.username || "";
  var password = req.body.password || "";

  if (username.trim() === "" || password.trim() === "") {
    res.json({
      err: true,
      msg: "username or password cannot be empty"
    });

    return;
  }

  getUser(username, password, function (e, user) {
    res.json(e ? {
      err: true,
      msg: e.message
    } : {
      err: false,
      data: user
    });
  });
});

app.use(function (req, res) {
  res.status(404).json({
    err: true,
    msg: "wrong end-point"
  });
});

app.listen(7331, function () {
  console.log("[APP] up");
});




