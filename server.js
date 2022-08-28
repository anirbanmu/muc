'use strict';

const process = require('process');
process.on('SIGINT', () => {
  console.log('SIGINT. Exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM. Exiting...');
  process.exit(0);
});

const MucCore = require('esm')(module)('./src/lib/muc-core').default;

const express = require('express');
const app = express();

const compression = require('compression');
app.use(compression());

const env = process.env.NODE_ENV || 'development';
if (env === 'production') {
  const enforce = require('express-sslify');
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use([/^(.*)\.ejs$/, '/'], express.static(__dirname + '/dist'));

app.set('views', process.env.EJS_TEMPLATE_DIR || (__dirname + '/dist/templates'));
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
