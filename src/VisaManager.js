const fs = require('fs');
const PaymentDao = require('./PaymentDao.js');
const request = require('request');
const ClientUtils = require('./ClientUtils.js');

const VISA_PAYMENT_URL = 'https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pushfundstransactions';
const VISA_ACCOUNT = { user: 'K8D3KAVDBYYEKP8BI3DP217-yJqZDc5_gPXgSS8NI6pt1FfZs', password: 'XvTLnHvBtvS4' };
const KEY_FILE = 'key_d75e35ee-3c5e-4418-a7dd-5e468fc2059d.pem';
const CERT_FILE = 'cert.pem';

const clientUtils = new ClientUtils();
const paymentDao = new PaymentDao();

module.exports = class VisaManager {
	payVisa(source, destination, amount) {
		return getVisaPayload(source, destination, amount)
			.then(payload => {
				return new Promise((resolve, reject) => {
					const options = {
						method: 'POST',
						uri: VISA_PAYMENT_URL,
						headers: {
							Authorization: clientUtils.getBasicAuthHeader(VISA_ACCOUNT.user, VISA_ACCOUNT.password),
							Accept: 'application/json'
						},
						key: fs.readFileSync(KEY_FILE),
						cert: fs.readFileSync(CERT_FILE),
						body: payload,
						json: true
					};

					request(options, (error, response, body) => {
						if (error) {
							reject(error);
							return;
						}

						const entry = {...body, pantryType: 'VISA'};

						paymentDao.create([entry]);
						resolve(entry);
					});
				});
			});
	}
};

function getRetrievalReferenceNumber(systemsTraceAuditNumber) {
	const date = new Date();
	const y = (date.getFullYear()+"").split('').reverse()[0];
	const d = ""+Math.ceil((date - new Date(date.getFullYear(),0,1)) / 86400000);
	const h = date.getHours() < 10 ? "0" + date.getHours() : "" + date.getHours();
	return y + d + h + systemsTraceAuditNumber;
}

function getVisaPayload(source, destination, amount) {
	const ourVisaBank = {
		"acquirerCountryCode": "840",
		"acquiringBin": "408999",
		"merchantCategoryCode": "6012",
		"businessApplicationId": "AA",
	};

	const ourCardTransactor = {
		"address": {
			"country": "USA",
			"county": "Las Vegas",
			"state": "NV",
			"zipCode": "89109"
		},
		"idCode": "NV-IDCode-77765",
		"name": "Pantry USA-Las Vegas",
		"terminalId": "TID-9999"
	};

	return paymentDao.getAll().then(payments => {
		const { recipientName, recipientPrimaryAccountNumber } = destination;
		const destinationSanitized = { recipientName, recipientPrimaryAccountNumber };

		const { senderAccountNumber, senderAddress, senderCity, senderCountryCode, senderName, senderReference, senderStateCode } = source;
		const sourceSanitized = { senderAccountNumber, senderAddress, senderCity, senderCountryCode, senderName, senderReference, senderStateCode };

		const systemsTraceAuditNumber = (payments.length + 1 + "").padStart(6, "0");
		const retrievalReferenceNumber = getRetrievalReferenceNumber(systemsTraceAuditNumber);
		const payload = {
			...destinationSanitized,
			...sourceSanitized,
			cardAcceptor: ourCardTransactor,
			...ourVisaBank,
			systemsTraceAuditNumber,
			"amount": clientUtils.getDollarCents(amount),
			"localTransactionDateTime": new Date().toISOString(),
			retrievalReferenceNumber,
			"transactionCurrencyCode": "USD"
		};

		return payload;
	});
}