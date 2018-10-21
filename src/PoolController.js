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

	createPools(pools) {
		const poolsToSave = pools.map(pool => {
			const { tiers, lat, long } = pool;
			const copy = { ...pool };
			delete copy.tiers;

			const location = { type: 'Point', coordinates: [+long, +lat] };
			const poolToSave = { ...copy, location };
			return poolToSave;
		});

		const tiers = pools.reduce((acc, val) => {
			acc[val.id] = val.tiers;
			return acc;
		}, {});

		return poolDao.create(poolsToSave)
			.then(pools => {
				return Promise.all(pools.map(pool => {
					const poolId = pool.id;
					const tierList = tiers[poolId];

					if (!tierList || !tierList.length) {
						return pool;
					}

					const poolTiers = tierList.map(tiers => ({ ...tiers, poolId }));

					return poolTierDao.create(poolTiers).then(tiers => ({ ...pool, tiers}));
				}));
			})
	}

	createPool(pool) {
		return this.createPools([pool]);
	}

	getPool(poolId) {
		return poolDao.get(poolId)
			.then(fetchTiers)
			.then(fetchUsers);
	}

	join(poolId, userId, units) {
		return poolUserDao.filter({ poolId, userId, paid: null })
			.then(res => {
				if (res && res.length) {
					// toggle the deleted
					const newUnits = units + res[0].units;
					return poolUserDao.update({ poolId }, { units: newUnits })
						.then(poolUser => ({ units: newUnits }));
				} else {
					// we create one
					return poolUserDao.create([{ poolId, userId, paid: null, units }])
						.then(poolUsers => {
							return { units: poolUsers[0].units };
						});
				}
			});
	}

	leave(poolId, userId, units) {
		return poolUserDao.filter({ poolId, userId, paid: null })
			.then(res => {
				if (res && res.length) {
					const newUnits = res[0].units - units;
					return poolUserDao.update({ poolId }, { units: newUnits })
						.then(poolUser => ({ units: newUnits }));
				}

				return {};
			});
	}

	collect(poolId, userId) {
		return poolUserDao.filter({ id: poolId, userId, paid: null })
			.then(res => {
				if (res) {
					// do the order transaction now...
					PaymentManager.doTransaction()
						.then(
							transactionId => {
								poolUserDao.update({ poolId }, { paid: Date.now()/1000 });
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

	return poolUserDao.filter({ poolId })
		.then(users => {
			const totalUnits = users.map(user => user.units).reduce((acc, val) => acc + val, 0);
			return { ...pool, totalUnits };
		});
}

function fetchTiers(pool) {
	if (!pool) return pool;

	const { id } = pool;
	const poolId = id;

	return poolTierDao.filter({ poolId })
		.then(tiers => ({ ...pool, tiers }));
}