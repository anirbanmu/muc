'use strict';

import process from 'process';
import MucCore from './src/lib/muc-core.mjs';
import express from 'express';
import compression from 'compression';
import enforce from 'express-sslify';

process.on('SIGINT', () => {
  console.log('SIGINT. Exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM. Exiting...');
  process.exit(0);
});

const app = express();
app.use(compression());

const env = process.env.NODE_ENV || 'development';
if (env === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use([/^(.*)\.ejs$/, '/'], express.static(process.env.DIST_DIR_ARG || ('dist')));

app.set('views', process.env.EJS_TEMPLATE_DIR || ('dist/templates'));
app.set('view engine', 'ejs');

app.get('/api/refresh-tokens', (req, res) => {
  MucCore.generateApiTokens()
    .then((tokens) => {
      res.json(tokens);
    })
    .catch((r) => {
      console.log(r);
      res.status(500).send();
    });
});

app.get('/', (req, res) => {
  MucCore.generateApiTokens()
    .then((tokens) => {
      res.render('index', {
        API_TOKENS_JSON: JSON.stringify(tokens)
      });
    })
    .catch((r) => {
      console.log(r);
      res.status(500).send('something went wrong');
    });
});

app.get('*', (req, res) => {
  res.redirect('/');
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log('Listening on port ' + port);
});
