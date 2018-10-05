const express = require('express');
const routes = require('./routes');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const models = require('./models');

const dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog';
const db = mongoose.connect(dbUrl, { useNewUrlParser: true });

const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();
app.locals.appTitle = 'blog-express';

app.use((req, res, next) => {
  if (!models.Article || !models.User) {
    return next(new Error('No models.'));
  }
  req.models = models;
  return next();
});

// Express.js configurations
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Express.js middleware configuration
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'))
app.use(session({secret: '2C44774A-D649-4D44-9535-46E296EF984F',
  resave: true,
  saveUninitialized: true}))

// Authentication middleware
app.use((req, res, next) => {
  if (req.session && req.session.admin) {
    res.locals.admin = true;
  }
  next();
});

// Authorization middleware
const authorize = (req, res, next) => {
  if (req.session && req.session.admin)
    return next();
  else
    return res.status(401).send();
}

if (app.get('env') === 'development') {
  app.use(errorHandler('dev'));
}

// Pages & Routes
app.get('/', routes.index);
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenticate);
app.get('/logout', routes.user.logout);
app.get('/admin', authorize, routes.article.admin);
app.get('/post', authorize, routes.article.post);
app.post('/post', authorize, routes.article.postArticle);
app.get('/articles/:slug', routes.article.show);

// Rest API Routes
app.all('/api', authorize);
app.get('/api/articles', routes.article.list);
app.post('/api/articles', routes.article.add);
app.put('/api/articles/:id', routes.article.edit);
app.delete('/api/articles/:id', routes.article.del);

app.all('*', (req, res) => {
  res.status(404).send();
});

const server = http.createServer(app);
const boot = () => {
  server.listen(app.get('port'), () => {
    console.info('Express server listening on port ' + app.get('port'));
  });
}
const shutdown = () => {
  server.close(process.exit);
}

if (require.main === module) {
  boot();
} else {
  console.info('Running app as module');
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}
