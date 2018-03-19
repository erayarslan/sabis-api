import low from 'lowdb';
import sha256 from 'js-sha256';
import storage from 'lowdb/lib/file-sync';

const db = low(`${__dirname}/db.json`, {storage});

db.defaults({users: []}).value();

export default {
  set: (username, password, obj) => {
    obj.password = sha256(obj.password);
    db.get('users').push(obj).value();
  },
  get: (username, password) => {
    return db.get('users').find({username, password: sha256(password)}).value();
  },
  exist: (username, password) => {
    return !!db.get('users').find({username, password: sha256(password)}).value();
  }
};