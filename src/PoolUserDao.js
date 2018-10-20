const Dao = require('./Dao.js');

module.exports = class PoolUserDao extends Dao {
	constructor() {
		super('poolsUsers');
	}
}