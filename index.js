const PoolController = require('./src/PoolController.js');

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const poolController = new PoolController();

const app = express();

// list all pools
app.get('/api/v1/pools', function(req, res) {
  const { lat, long } = req.query;

  if (lat && long) {
    poolController.findClosestPools(lat, long)
      .then(
        pools => res.send(pools),
        err => {
          console.log(err);
          res.send(err);
        });
      return;
  }

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

// create pool
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

// get a specific pool
app.get('/api/v1/pools/:poolId', function(req, res) {
	const { poolId } = req.params;
	poolController.getPool(poolId)
    .then(
      pools => res.send(pools),
      err => res.send(err));
});

// join a pool
app.post('api/v1/pools/:poolId/users/:userId', function(req, res) {
  const { poolId, userId } = req.params;
  poolController.join(poolId, userId)
    .then(
      pools => res.send(pools),
      err => res.send(err));

});

// leave a pool
app.delete('api/v1/pools/:poolId/users/:userId', function(req, res) {
  const { poolId, userId } = req.params;
  poolController.leave(poolId, userId)
    .then(
      pools => res.send(pools),
      err => res.send(err));
});

// confirm a purchase
app.post('api/v1/pools/:poolId/users/:userId/purchase', function(req, res) {
	const { userId, poolId } = req.params;
	res.send(poolController.collect(poolId, userId));
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
