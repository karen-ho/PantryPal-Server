const Dao = require('./Dao.js');

module.exports = class PoolDao extends Dao {
	constructor() {
		super('poolsTiers');
	}
}