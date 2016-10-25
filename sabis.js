var Nightmare = require('nightmare');

var loginForm = 'form[action *= "/tr/Login"]';

module.exports = {
  doLogin: function (username, password, next) {
    Nightmare({waitTimeout: 10000})
      .cookies.clearAll()
      .goto('http://ogr.sakarya.edu.tr/')
      .type(loginForm + ' [name=UserName]', username)
      .type(loginForm + ' [name=Password]', password)
      .click(loginForm + ' [type=submit]')
      .wait('.userinfo')
      .evaluate(function () {
        return document.querySelector('.table-responsive').innerText.split('\n');
      })
      .end()
      .then(function (result) {
        if (result.length > 0) {
          var user = {
            id: result[2], name: result[0],
            username: username,
            password: password,
            faculty: result[3], department: result[4],
            program: result[5], adviser: result[6],
            male: result[7].indexOf("Askerlik") > -1,
            tokens: []
          };

          user.payed = (user.male ? result[8] : result[7]).substr(13) === "Ödendi";
          user.registered = (user.male ? result[9] : result[8]).substr(14);

          next(null, user);
        } else {
          next(new Error('user not found'), null);
        }
      })
      .catch(function (e) {
        console.log(e);
        next(new Error('user not found'), null);
      });
  }
};