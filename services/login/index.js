const Middleware = require('./middleware');

class LoginService {
  constructor(options) {
    this.db = options.db;
    this.jwtkey = options.jwtkey;
    this.passport = options.passport;

    this.app = options.app;

    const middleware = new Middleware({ jwtkey: this.jwtkey });
    const auth = this.passport.authenticate('local', { session: false, failWithError: true });

    this.app.post('/login', auth, middleware.login());
  }
}

module.exports = LoginService;
