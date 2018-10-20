const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

app.get('/api/v1/pool', function(req, res) {
  res.send('stub..');
});

app.post('/api/v1/pool', function(req, res) {
  res.send('stub..');
});

app.get('/api/v1/pool/:poolId', function(req, res) {
  res.send(req.params.poolId);
});

app.post('/pool/:poolId/user/:userId', function(req, res) {
  res.send({ 'poolId': req.params.poolId, 'userId': req.params.userId });
});

app.delete('/pool/:poolId/user/:userId', function(req, res) {
  res.send({ 'poolId': req.params.poolId, 'userId': req.params.userId });
});

app.post('/pool/{id}/user/{userId}/purchase', function(req, res) {
  res.send({ 'poolId': req.params.poolId, 'userId': req.params.userId });
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


/*

  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  */