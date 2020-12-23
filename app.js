const express = require('express');
const app = express();
const port = 3000;
const request = require('request-promise');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(cors());

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'lab3'
});

connection.connect();

const APP_ID = '4f9daa6adb52684f45d6a42b2a313564';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
function url(path) {
  return `${BASE_URL}${path}&appid=${APP_ID}&units=metric&lang=ru`;
}

app.get('/weather/city', (req, res) => {
  const options = {
    method: 'GET',
    uri: encodeURI(url(`weather?q=${req.query.q}`)),
  };

  console.log(req.query.q);
  request(options)
    .then(function (response) {
      res.send(response);
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).send({ error: 'Server error' });
    });
});

app.get('/weather/coordinates', (req, res) => {
  const options = {
    method: 'GET',
    uri: url(`weather?lat=${req.query.lat}&lon=${req.query.lon}`),
  };

  request(options)
    .then(function (response) {
      res.send(response);
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).send({ error: 'Server error' });
    });
});

// //db
app.get('/favourites', (request, response) => {
  connection.query('SELECT name from favourites', function (err, rows, fields) {
    if (err) throw err;
    response.json(rows);
  });
});

app.post('/favourites', (request, response) => {
  connection.query(`insert into favourites(name) values('${request.body.name}')`, function (err, rows, fields) {
    if (err) {
      console.log(err);
      response.status(500).send();
    } else {
      console.log('insertID: ', rows.insertId);
      response.status(201).send(rows);
    }
  });
});

app.delete('/favourites', (request, response) => {
  connection.query(`delete from favourites where name='${request.body.name}'`, function (err, rows, fields) {
    if (err) throw err;
    response.status(201).send();
  });
});

app.listen(port, (err) => {
  if (err) {
    return console.log('fatal error', err);
  }
  console.log(`server is listening on ${port}`);
});
