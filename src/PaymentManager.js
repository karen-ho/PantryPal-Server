const PaymentDao = require('./PaymentDao.js');
const PaymentProfileDao = require('./PaymentProfileDao.js');
const VisaManager = require('./VisaManager.js');

const paymentDao = new PaymentDao();
const paymentProfileDao = new PaymentProfileDao();

const visaManager = new VisaManager();

module.exports = class PaymentManager {
	processTransaction(userId, lat, long, amount, type) {
		return Promise.all([
				paymentProfileDao.filter({ userId, type }),
				paymentProfileDao.filter({ lat, long, type })
			])
			.then(profiles => {
				const [[source], [destination]] = profiles;

				if (source === null) return;
				if (destination === null) return;

				if (type === 'VISA') {
					return visaManager.payVisa(source, destination, amount);
				}
			});
	}
};