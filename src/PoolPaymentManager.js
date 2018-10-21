const PaymentManager = require('./PaymentManager.js');
const PoolController = require('./PoolController.js');

const paymentManager = new PaymentManager();
const poolController = new PoolController();
const ONE_DAY_MILLISECONDS = 24*60*60*1000;

module.exports = class PoolPaymentManager {
	processPool(pool) {
		console.log(`checking ${pool.id} pool if it should be paid for`);

		if (pool.end >= Date.now()/1000 && pool.end <= (Date.now() + (ONE_DAY_SECONDS * 2))/1000) {
			// pool has not ended so skip it
			return Promise.resolve();
		}

		console.log('pool ${pool.id} expired and needs to be paid for');

		return new Promise((resolve, reject) => {
			const { tiers, users, totalUnits } = pool;

			const selectedTier = tiers.sort(sortTierDescending)
				.find(tier => tier.threshold < totalUnits);

			users.map(poolUser => {
				const { units } = poolUser;
				const amount = selectedTier.price * units;

				const { poolId, userId } = poolUser;

				// src, destination, amount
				Promise.all(paymentManager.processTransaction(src, destination, amount)
					.then(resp => {
						poolController.pay(poolId, userId);
					}, err => {
						reject(err);
					})).then(resolve);
			});
		});
	}
};

function sortTierDescending(a, b) {
	return b.price - a.price;
}