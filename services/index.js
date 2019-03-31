const AppAPI = require('./app_api');
const Auth = require('./auth');
const Login = require('./login');

const setupServices = (app, passport, jwtkey) => {
  const appApi = new AppAPI({ app, db: app.knex, passport });
  const auth = new Auth({ app, db: app.knex, passport });
  const login = new Login({
    app, db: app.knex, passport, jwtkey,
  });
  // console.log('appApi', appApi);
  // console.log('login', login);
};

exports.setupServices = setupServices;
