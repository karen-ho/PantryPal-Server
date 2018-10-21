const Dao = require('./Dao.js');

module.exports = class PaymentDao extends Dao {
	constructor() {
		super('payments');
	}
}