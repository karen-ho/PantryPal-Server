const PoolDao = require('./PoolDao.js');
const PoolUserDao = require('./PoolUserDao.js');
const PoolTierDao = require('./PoolTierDao.js');

const poolDao = new PoolDao();
const poolUserDao = new PoolUserDao();
const poolTierDao = new PoolTierDao();

module.exports = class PoolController {
	constructor() {

	}

	getPools() {
		return poolDao.getAll()
			.then(pools => pools.map(fetchTiers));
	}

	createPool(pool) {
		const { tiers } = pool;
		const copy = { ...pool };
		delete copy.tiers;

		const poolToSave = copy;
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
			.then(fetchTiers);
	}

	join(poolId, userId) {
		return poolUserDao.filter({ id: poolId, userId, deleted: true })
			.then(res => {
				if (res) {
					// toggle the deleted
					return poolUserDao.update(poolId, { deleted: false, deletedTimestamp: Date.now() });
				} else {
					// we create one
					return poolUserDao.create({ id: poolId, userId, deleted: false, deletedTimestamp: null });
				}
			});
	}

	collect(poolId, userId) {
		// commit transaction at this point
		// delete pool entry
	}
}

function fetchUsers(pool) {
	if (!pool) return pool;

	const { id } = pool;
	const poolId = id;

	return poolUserDao.filter({ poolId })
}

function fetchTiers(pool) {
	if (!pool) return pool;

	const { id } = pool;
	const poolId = id;

	return poolTierDao.filter({ poolId })
		.then(tiers => ({ ...pool, tiers }));
}