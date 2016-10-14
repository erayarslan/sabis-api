var express = require('express');
var Nightmare = require('nightmare');
var md5 = require('md5');

var app = express();

var cache = {};

var fetchUser = function (username, password, next) {
  Nightmare({
    waitTimeout: 10
  })
    .cookies.clearAll()
    .goto('http://ogr.sakarya.edu.tr/')
    .type('form[action*="/tr/Login"] [name=UserName]', username)
    .type('form[action*="/tr/Login"] [name=Password]', password)
    .click('form[action*="/tr/Login"] [type=submit]')
    .wait('.userinfo')
    .evaluate(function () {
      return document
        .querySelector('.table-responsive')
        .innerText
        .split('\n');
    })
    .end()
    .then(function (result) {
      if (result.length > 0) {
        var o = {
          id: result[2],
          name: result[0],
          faculty: result[3],
          department: result[4],
          program: result[5],
          adviser: result[6]
        };

        o.male = result[7].indexOf("Askerlik") > -1;
        o.payed = (o.male ? result[8] : result[7]).substr(13) === "Ödendi";
        o.registered = (o.male ? result[9] : result[8]).substr(14);

        next(null, o);
      } else {
        next(new Error('user not found'), null);
      }
    })
    .catch(function (e) {
      next(new Error('user not found'), null);
    });
};

var getUser = function (username, password, next) {
  var hash = md5(md5(username) + md5(password));
  if (cache.hasOwnProperty(hash)) {
    next(null, cache[hash])
  } else {
    fetchUser(username, password, function (e, user) {
      if (!e) {
        next(null, user);
        cache[hash] = user;
      } else {
        next(e, null);
      }
    });
  }
};

app.get('/:username/:password', function (req, res) {
  getUser(
    req.params.username,
    req.params.password,
    function (e, user) {
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




