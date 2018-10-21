const Dao = require('./Dao.js');

module.exports = class PaymentProfileDao extends Dao {
	constructor() {
		super('paymentProfiles');
	}
}