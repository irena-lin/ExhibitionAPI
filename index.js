const Express = require('express');
const bodyParser = require('body-parser');
const Knex = require('knex');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const bcrypt = require('bcrypt');

const config = require('./config');
const services = require('./services');

const app = Express();

app.knex = Knex(config.db);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Express.static('image'));
app.use(passport.initialize());

passport.use('local', new LocalStrategy(config.localSchema,
  (async (name, password, done) => {
    console.log('user');
    const userQuery = await app.knex('user').select().where({ name });
    console.log(userQuery);
    if (userQuery.length === 0) {
      console.log('User not found');
      return done(null, false);
    }

    const passwordValid = await bcrypt.compare(password, userQuery[0].password);

    if (!passwordValid) {
      console.log('User password incorrect');
      return done(null, false);
    }
    // if (userQuery[0].password !== password) {
    //   return done(null, false);
    // }

    console.log('Log in OK!');
    return done(null, userQuery[0]);
  })));

async function findById(id) {
  try {
    const user = await app.knex('user').select()
      .where('Uid', id);

    if (user.length === 0) throw new Error(`User ID ${id} not found.`);

    return {
      id: user[0].Uid,
      name: user[0].name,
      permission: user[0].permission,
    };
  } catch (err) {
    throw err;
  }
}

passport.use(new JwtStrategy(config.jwtOptions,
  (payload, done) => {
    console.log('payload', payload);
    const id = payload.Uid;

    findById(id)
      .then((user) => {
        console.log(user);
        done(null, user);
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  }));

services.setupServices(app, passport, config.jwtkey);

app.listen('3000', () => {
  console.log('connected localhost:3000');
});
