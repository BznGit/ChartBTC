const session = require('express-session');
const redis = require('redis');
const redisClient = redis.createClient();
redisClient.connect();
const RedisStore = require("connect-redis").default;

module.exports = session({
  store: new RedisStore({ client: redisClient }),
  secret: 'mySecret',
  saveUninitialized: false,
  resave: false,
  name: 'sessionId',
  cookie: {
    secure: false, // if true: only transmit cookie over https, in prod, always activate this
    httpOnly: true, // if true: prevents client side JS from reading the cookie
    maxAge: 1000 * 60 * 30, // session max age in milliseconds
    // explicitly set cookie to lax
    // to make sure that all cookies accept it
    // you should never use none anyway
    sameSite: 'lax',
  },
});
