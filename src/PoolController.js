const PaymentManager = require('./PaymentManager.js');

const PoolDao = require('./PoolDao.js');
const PoolUserDao = require('./PoolUserDao.js');
const PoolTierDao = require('./PoolTierDao.js');

const poolDao = new PoolDao();
const poolUserDao = new PoolUserDao();
const poolTierDao = new PoolTierDao();

module.exports = class PoolController {
	constructor() {

	}

	findClosestPools(lat, long) {
		return poolDao.findNearest(lat, long);
	}

	getPools() {
		return poolDao.getAll()
			.then(pools => Promise.all(pools.map(fetchTiers)))
			.then(pools => Promise.all(pools.map(fetchUsers)));
	}

	createPool(pool) {
		const { tiers, lat, long } = pool;
		const copy = { ...pool };
		delete copy.tiers;

		const location = { type: 'Point', coordinates: [+long, +lat] };
		const poolToSave = { ...copy, location };

		return poolDao.create([poolToSave])
			.then(pools => {
				const [pool] = pools;

				if (!tiers) {
					console.log('early');
					return pool;
				}

				const poolId = pool.id;
				const poolTiers = tiers.map(tiers => ({ ...tiers, poolId }));

				return poolTierDao.create(poolTiers).then(tiers => ({ ...pool, tiers}));
			})
	}

	getPool(poolId) {
		return poolDao.get(poolId)
			.then(fetchTiers)
			.then(fetchUsers);
	}

	join(poolId, userId) {
		return poolUserDao.filter({ id: poolId, userId, deleted: true, paid: null })
			.then(res => {
				if (res) {
					// toggle the deleted
					return poolUserDao.update(poolId, { deleted: false, deletedTimestamp: Date.now() });
				} else {
					// we create one
					return poolUserDao.create({ id: poolId, userId, deleted: false, deletedTimestamp: null, paid: null });
				}
			});
	}

	leave(poolId, userId) {
		return poolUserDao.filter({ id: poolId, userId, deleted: false, paid: null })
			.then(res => {
				if (res) {
					// toggle the deleted
					return poolUserDao.update(poolId, { deleted: true, deletedTimestamp: Date.now() });
				}

				return {};
			});
	}

	collect(poolId, userId) {
		return poolUserDao.filter({ id: poolId, userId, deleted: false, paid: null })
			.then(res => {
				if (res) {
					// do the order transaction now...
					PaymentManager.doTransaction()
						.then(
							transactionId => {
								poolUserDao.update(poolId, { paid: Date.now() });
								return transactionId;
							},
							error => error
						);

					// mark the item as paid
				}

				return {};
			});
	}
}

function fetchUsers(pool) {
	if (!pool) return pool;

	const { id } = pool;
	const poolId = id;

	return poolUserDao.filter({ poolId, deleted: false })
		.then(users => ({ ...pool, users}));
}

function fetchTiers(pool) {
	if (!pool) return pool;

	const { id } = pool;
	const poolId = id;

	return poolTierDao.filter({ poolId })
		.then(tiers => ({ ...pool, tiers }));
}