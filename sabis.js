import Nightmare from 'nightmare';

export default class Sabis {
  static loginForm = 'form[action *= "/tr/Login"]';
  static url = 'http://ogr.sakarya.edu.tr/';
  static waitFor = '.userinfo';

  static mapResult(username, password, result) {
    let user = {
      id: result[2], name: result[0], username, password,
      faculty: result[3], department: result[4],
      program: result[5], adviser: result[6],
      male: result[7].indexOf("Askerlik") > -1
    };

    user.payed = (user.male ? result[8] : result[7]).substr(13) === "Ödendi";
    user.registered = (user.male ? result[9] : result[8]).substr(14);

    return user;
  }

  login(username, password) {
    return new Promise((resolve, reject) => {
      Nightmare({waitTimeout: 20000}).cookies.clearAll()
        .goto(Sabis.url)
        .type(`${Sabis.loginForm} [name=UserName]`, username)
        .type(`${Sabis.loginForm} [name=Password]`, password)
        .click(`${Sabis.loginForm} [type=submit]`)
        .wait(Sabis.waitFor)
        .evaluate(() => document.querySelector('.table-responsive').innerText.split('\n'))
        .end()
        .then(result => {
          if (result.length > 0) {
            const user = Sabis.mapResult(username, password, result);

            resolve(user);
          } else {
            reject(new Error('user not found'));
          }
        })
        .catch(() => {
          reject(new Error('user not found'));
        });
    });
  }
}