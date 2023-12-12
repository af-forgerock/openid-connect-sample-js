require('dotenv').config()
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { jwtDecode } = require('jwt-decode');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const { Issuer, Strategy } = require('openid-client');

const app = express();

app.use(logger('dev', {skip: req => req.originalUrl === '/' || req.originalUrl === '/favicon.ico'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
      secret: 'openid-connect-sample-secret',
      resave: true,
      saveUninitialized: false,
      cookie: {
        path:'/',
        maxAge: 100 * 10 * 60 * 60 * 1,
        httpOnly:true,
        secure:'auto'
      },
    })
);

app.use(passport.initialize());
app.use(passport.session());

Issuer.discover(
  process.env.BASE_OIDC_DISCOVERY_URL
).then((authServer) => {
  const client = new authServer.Client({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: [`${process.env.BASE_REDIRECT_URL}/login/callback`],
    post_logout_redirect_uris: [`${process.env.BASE_REDIRECT_URL}/logout/callback`],
    token_endpoint_auth_method: 'client_secret_basic',
  });

  passport.use(
    'oidc',
    new Strategy({ client }, (tokenSet, userinfo, done) => {
      return done(null, tokenSet);
    })
  );

  //handles serialization and deserialization of authenticated user
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  const scope = 'openid' + (process.env.ADDITIONAL_SCOPES ? ' ' + process.env.ADDITIONAL_SCOPES : '');
  app.get('/login', passport.authenticate('oidc', { scope }));

  app.get('/login/callback', passport.authenticate('oidc', { successRedirect: '/', failureRedirect: '/' }));

  app.get('/logout', (req, res, next) => {
    if (req.user && req.user.id_token) {
      res.redirect(client.endSessionUrl({id_token_hint:req.user.id_token}));
    } else {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    }
  });

  app.get('/logout/callback', (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

  console.log('Server started');
}).catch(err => console.log(err));

app.get('/me', (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.sendStatus(401);
    return;
  }
  next();
}, (req, res) => {
  let result = {
    access_token: req.user.access_token,
    access_token_payload: {...jwtDecode(req.user.access_token)},
    id_token: req.user.id_token,
    id_token_payload: jwtDecode(req.user.id_token)
  };

  if (req.user.refresh_token) {
    result.refresh_token = req.user.refresh_token;
    result.refresh_token_payload = jwtDecode(req.user.refresh_token);
  }

  res.send(result);
});

module.exports = app;
