const PaymentManager = require('./PaymentManager.js');
const PoolController = require('./PoolController.js');

const paymentManager = new PaymentManager();
const poolController = new PoolController();
const ONE_DAY_MILLISECONDS = 24*60*60*1000;

module.exports = class PoolPaymentManager {
	processPool(pool) {
		console.log(`checking pool ${pool.id} if it should be paid for`);

		if (pool.end >= Date.now()/1000 && pool.end <= (Date.now() + (ONE_DAY_MILLISECONDS * 2))/1000) {
			// pool has not ended so skip it
			return Promise.resolve();
		}

		console.log(`pool ${pool.id} expired and needs to be paid for`);

		return new Promise((resolve, reject) => {
			const { tiers, users, totalUnits, lat, long, pluName } = pool;

			const selectedTier = tiers.sort(sortTierDescending)
				.find(tier => tier.threshold <= totalUnits);

			Promise.all(users.map(poolUser => {
				const { units, paymentType } = poolUser;
				const amount = selectedTier.price * units;

				const { poolId, userId } = poolUser;

				return paymentManager.processTransaction(userId, lat, long, amount, paymentType, pluName, units)
					.then(resp => {
						console.log('response...')
						console.log(resp);
						poolController.pay(poolId, userId);
					}, err => {
						console.log("errored");
						console.log(err);
						reject(err);
					});
			})).then(resolve, reject);
		});
	}
};

function sortTierDescending(a, b) {
	return b.price - a.price;
}