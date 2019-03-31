const jwt = require('jsonwebtoken');

class LoginMiddelware {
  constructor(options) {
    this.jwtkey = options.jwtkey;
  }

  login() {
    return async (req, res) => {
      console.log(req);
      const token = jwt.sign({ Uid: req.user.Uid }, this.jwtkey, { expiresIn: '1h' });
      return res.json({ token });
    };
  }
}

module.exports = LoginMiddelware;
