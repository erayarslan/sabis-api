var low = require('lowdb');
var md5 = require('md5');
var storage = require('lowdb/lib/file-sync');

var db = low(__dirname + '/db.json', {
  storage: storage
});

db.defaults({users: []}).value();

module.exports = {
  set: function (username, password, obj) {
    obj.password = md5(obj.password);
    db.get('users').push(obj).value();
  },
  get: function (username, password) {
    return db.get('users').find({username: username, password: md5(password)}).value();
  },
  exist: function (username, password) {
    return !!db.get('users').find({username: username, password: md5(password)}).value();
  }
};