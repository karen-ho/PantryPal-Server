const PoolController = require('./src/PoolController.js');

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const poolController = new PoolController();

const app = express();

app.get('/api/v1/pools', function(req, res) {
	poolController.getPools()
    .then(poolPromises => Promise.all(poolPromises)
      .then(pools => {
        res.send(pools);
      }),
    err => {
      console.log(err);
      res.send(err);
    });
});

app.post('/api/v1/pools', function(req, res) {
  req.on('data', data => {
    const body = JSON.parse(data);

    if (!body) {
      res.send('incomplete');
      return;
    }

    poolController.createPool(body)
      .then(pool => res.send(pool), err => res.send(err));
  });
});

app.get('/api/v1/pools/:poolId', function(req, res) {
	const { poolId } = req.params;
	poolController.getPool(req.params.poolId)
    .then(pools => res.send(pools), err => res.send(err));
});

app.post('api/v1/pools/:poolId/users/:userId', function(req, res) {
  res.send({ 'poolId': req.params.poolId, 'userId': req.params.userId });
});

app.delete('api/v1/pools/:poolId/users/:userId', function(req, res) {
  res.send({ 'poolId': req.params.poolId, 'userId': req.params.userId });
});

app.post('api/v1/pools/:poolId/users/:userId/purchase', function(req, res) {
	const { userId, poolId } = req.params;
	res.send(poolController.collect(poolId, userId));
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
