const Dao = require('./Dao.js');

module.exports = class PoolTierDao extends Dao {
	constructor() {
		super('pools');
	}
}