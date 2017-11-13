const Koa = require('koa');
const Router = require('koa-router');
const session = require('koa-session');
const koaBody = require('koa-body');
const winston = require('winston');

// Instances
const app = new Koa();
const router = new Router();

// Application level variables
const PORT = process.env.PORT || 8080;
const CONFIG = {
    key: 'koa:sess',
    maxAge: 86400000,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: true,
};
const USERS = [
    {
        username: 'root',
        password: '1234',
    }
];

// Koa level set up
app.keys = ['firstkey4cookies', 'secondkey4cookies'];

// Config
app.use(koaBody());
app.use(session(CONFIG, app));
winston.level = 'info';

// Set up routes
router.post('/auth/login', async ctx => {
    const username = ctx.request.body.username;
    const password = ctx.request.body.password;
    
    if (!username || !password) {
        ctx.status = 400;
        ctx.body = {
            message: 'Not username or password',
        };
    }else {
        const logged = USERS.find(x => x.username === username && x.password === password);
        if (logged) {
            ctx.session.user = logged;
            ctx.status = 200;
            ctx.body = {
                message: 'Successfully logged',
            };
        }else {
            ctx.status = 401;
            ctx.body = {
                message: 'Not authorized',
            }
        }
    }
});

router.get('/auth/logout', async ctx => {
    ctx.session = null;
    ctx.status = 204;
});

router.get('/data/test', async ctx => {
    if (!ctx.session.user) {
        ctx.status = 401;
        ctx.body = {
            message: 'Not authorized'
        };
    }else {
        ctx.status = 200;
        ctx.body = [1, 2, 3, 4, 5];
    }
});

// Config routes to Koa
app.use(router.routes()).use(router.allowedMethods());

// Listen
winston.info('[HTTP Server]', `Started at port: ${PORT}`);
app.listen(PORT);

