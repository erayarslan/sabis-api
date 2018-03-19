import express from 'express';
import bodyParser from 'body-parser';

import Sabis from './sabis';
import Cache from './cache';

const app = express();
const sabis = new Sabis();

const port = process.env.PORT || 7331;

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const fetchUserOrGetFromCache = function (username, password) {
  return new Promise((resolve, reject) => {
    if (Cache.exist(username, password)) {
      resolve(Cache.get(username, password));
    } else {
      sabis.login(username, password)
        .then(user => {
          Cache.set(username, password, user);
          resolve(Cache.get(username, password));
        })
        .catch(reject);
    }
  });
};

app.post('/', (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';

  if (username.trim() === '' || password.trim() === '') {
    res.json({err: true, msg: 'username or password cannot be empty'});
  } else {
    fetchUserOrGetFromCache(username, password)
      .then(user => {
        res.json({err: false, data: user});
      })
      .catch(e => {
        res.json({err: true, msg: e.message});
      });
  }
});

app.use((req, res) => {
  res.status(404).json({err: true, msg: 'wrong end-point'});
});

app.listen(port, console.log.bind(null, `[APP] ${port}`));
