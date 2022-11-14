import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import request from 'request';
import cors from 'cors';
import { web } from '../../config.json';
import redis from '.././utility/redis';
import * as Logger from '../utility/logger';

import join from './routers/join';
import top from './routers/top';
import channel from './routers/channel';
import global from './routers/global';

const app = express();
let RedisStore = require('connect-redis')(session);

declare module 'express-session' {
    export interface SessionData {
        user: { [key: string]: any };
    }
}

const TWITCH_CLIENT_ID = web.clientID;
const TWITCH_SECRET = web.twitchSecret;
const SESSION_SECRET = web.sessionSecret;
const CALLBACK_URL = web.callbackURL;

app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({ client: redis }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        },
    }),
    passport.session(),
    passport.initialize(),
    cors(),
    express.json(),
    express.urlencoded({ extended: true }),
    [join, top, channel, global]
);

OAuth2Strategy.prototype.userProfile = function (accessToken: string, done) {
    const options = {
        url: 'https://api.twitch.tv/helix/users',
        method: 'GET',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Authorization': 'Bearer ' + accessToken,
        },
    };

    request(options, function (error: any, response: { statusCode: number }, body: string) {
        if (response && response.statusCode == 200) {
            done(null, JSON.parse(body));
        } else {
            done(JSON.parse(body));
        }
    });
};

passport.serializeUser(function (user: any, done: (arg0: any, arg1: any) => void) {
    done(null, user);
});

passport.deserializeUser(function (user: any, done: (arg0: any, arg1: any) => void) {
    done(null, user);
});

passport.use(
    'twitch',
    new OAuth2Strategy(
        {
            authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
            tokenURL: 'https://id.twitch.tv/oauth2/token',
            clientID: TWITCH_CLIENT_ID,
            clientSecret: TWITCH_SECRET,
            callbackURL: CALLBACK_URL,
            state: true,
        },
        function (
            accessToken: any,
            refreshToken: any,
            profile: { accessToken: any; refreshToken: any },
            done: (arg0: any, arg1: any) => void
        ) {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;

            // Securely store user profile in your DB
            //User.findOrCreate(..., function(err, user) {
            //  done(err, user);
            //});

            done(null, profile);
        }
    )
);

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: '' }));

// Set route for OAuth redirect
app.get(
    '/auth/twitch/callback',
    passport.authenticate('twitch', {
        successRedirect: '/',
        failureRedirect: '/',
    })
);

app.use('/', express.static(`${__dirname}/public`));

app.get('/api/twitch', (req: any, res: any) => {
    if (req.session && req.session.passport && req.session.passport.user) {
        return res.send({ success: true, id: req.session.passport });
    } else {
        return res.status(401).send({ success: false, error: 'Unauthorized' });
    }
});

app.get('/auth/twitch/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        } else {
            return res.redirect('/');
        }
    });
});

app.get('*', (req: any, res: any) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.listen(web.port, () => {
    Logger.info(`Website listening on ${web.port}`);
});
