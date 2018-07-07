var express = require('express');
var app = express();

app.use([/^(.*)\.ejs$/, '/'], express.static(__dirname + '/dist'))

app.set('views', __dirname + '/dist/templates');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { API_TOKENS_JSON: JSON.stringify({ spotifyToken: 'REPLACE-ME' }) });
});

app.get('*', (req, res) => {
  res.redirect('/');
});

app.listen(8081, ()=>{
  console.log('API listening on port 8081');
});
