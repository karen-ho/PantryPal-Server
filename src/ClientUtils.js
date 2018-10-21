module.exports = class ClientUtils {
	getBasicAuthHeader(userId, password) {
		const token = new Buffer(userId + ':' + password).toString('base64');
		return `Basic ${token}`;
	}

	getDollarCents(number) {
		const parts = (""+number).split('.');
		const dollars = parts[0];
		const cents = parts.length === 1 ? '00' : parts[1].substring(0, 2);

		if (cents.length === 0) {
			return `${dollars}.00`;
		}

		if (cents.length === 1) {
			return `${dollars}.${cents}0`;
		}

		return `${dollars}.${cents}`;
	}
};