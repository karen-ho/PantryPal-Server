const PaymentManager = require('./src/PaymentManager.js');
const PoolController = require('./src/PoolController.js');
const PoolPaymentManager = require('./src/PoolPaymentManager.js');

const cron = require('node-cron');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000

const poolController = new PoolController();
const poolPaymentManager = new PoolPaymentManager();

const app = express();

const paymentManager = new PaymentManager();

/** cron jobs **/
cron.schedule('0 0 1 * * *', runPoolPaymentJob);

function runPoolPaymentJob() {
  console.log(`running pool payment job ${Date.now()}`);
  poolController.getPoolsWithUsers()
    .then(pools => {
      return pools.map(poolPaymentManager.processPool);
    });
}

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

// create pools
app.post('/api/v1/pools', function(req, res) {
  req.on('data', data => {
    const body = JSON.parse(data);

    if (!body) {
      res.send('incomplete');
      return;
    }

    const pools = body;
    poolController.createPools(pools).then(
        pools => res.send(pools),
        err => res.send(err)
      );
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
app.post('/api/v1/pools/:poolId/users/:userId', function(req, res) {
  const { poolId, userId } = req.params;
  req.on('data', data => {
    const body = JSON.parse(data);

    if (!body) {
      res.send('incomplete');
      return;
    }

    const { units } = body;
    poolController.join(poolId, userId, units)
      .then(
        pools => res.send(pools),
        err => res.send(err));
  });
});

// leave a pool
app.delete('/api/v1/pools/:poolId/users/:userId', function(req, res) {
  const { poolId, userId } = req.params;
  req.on('data', data => {
    const body = JSON.parse(data);

    if (!body) {
      res.send('incomplete');
      return;
    }

    const { units } = body;
    poolController.leave(poolId, userId, units)
      .then(
        pools => res.send(pools),
        err => res.send(err));
    });
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
