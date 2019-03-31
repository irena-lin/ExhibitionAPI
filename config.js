const ExtractJwt = require('passport-jwt').ExtractJwt; // eslint-disable-line

const db = {
  client: 'mysql',
  connection: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'irena',
    database: 'exhibition',
  },
};

const localSchema = {
  usernameField: 'name',
  passwordField: 'password', // 是Field!!!!!!不要再打錯字！（400 Bad Request 解決）
};

const jwtkey = 'jwtkey';
const jwtOptions = {
  // jwtFormRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // jwt format
  // secretOrKey: jwtkey, // encryption key
};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = jwtkey;


module.exports = {
  db, localSchema, jwtkey, jwtOptions,
};
