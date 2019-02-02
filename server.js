'use strict';

const MucCore = require('esm')(module)('./src/lib/muc-core');

const express = require('express');
const app = express();

app.use([/^(.*)\.ejs$/, '/'], express.static(__dirname + '/dist'));

app.set('views', __dirname + '/dist/templates');
app.set('view engine', 'ejs');

app.get('/api/refresh-tokens', (req, res) => {
  MucCore.generateApiTokens()
    .then(tokens => {
      res.json(tokens);
    })
    .catch(r => {
      console.log(r);
      res.status(500).send();
    });
});

app.get('/', (req, res) => {
  MucCore.generateApiTokens()
    .then(tokens => {
      res.render('index', {
        API_TOKENS_JSON: JSON.stringify(tokens)
      });
    })
    .catch(r => {
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
