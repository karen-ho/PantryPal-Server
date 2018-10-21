const fs = require('fs');
const PaymentDao = require('./PaymentDao.js');
const request = require('request');
const ClientUtils = require('./ClientUtils.js');

const PAYPAL_BASE = 'https://api.sandbox.paypal.com';
const PAYPAL_ACCOUNT = { user: 'AS81k09c5jV1eBTgVUD48QLEw4N0DYiWCpOtxpi32OQFhT27k9V9L3zCRopeJz2dwHTd1u2hclIVvmLn', password: 'EBqiVFQDMPp6W0grXnuWS_QKmHDwd24YMIUGjWhhkxygZJH3wzn_1diuTrxqXTZ3was1pSnEWEkmBlgq' };
const PAYPAL_BASE_PAY_CONFIG = {
  "note_to_payer": "Contact us for any questions on your order.",
  "redirect_urls": {
    "return_url": "https://pantrypal2018.herokuapp.com/return",
    "cancel_url": "https://pantrypal2018.herokuapp.com/cancel"
  }
};

const clientUtils = new ClientUtils();
const paymentDao = new PaymentDao();

module.exports = class PayPalManager {
	payPayPal(source, destination, amount, pluName, units) {
		return getAccessToken()
			.then(accessToken => {
				getPayPalPayload(source, destination, amount, pluName, units)
					.then(payload => {
						return new Promise((resolve, reject) => {
							const options = {
								method: 'POST',
								uri: `${PAYPAL_BASE}/v1/payments/payment`,
								headers: {
									Authorization: `Bearer ${accessToken}`,
									Accept: 'application/json'
								},
								body: payload,
								json: true
							};

							request(options, (error, response, body) => {
								if (error) {
									reject(error);
									return;
								}

								const entry = {...body, pantryType: 'PAYPAL'};

								paymentDao.create([entry]);
								resolve(entry);
							});
						});
					});
				});
	}
};

function getAccessToken() {
	const options = {
		method: 'POST',
		uri: `${PAYPAL_BASE}/v1/oauth2/token`,
		headers: {
			Authorization: clientUtils.getBasicAuthHeader(PAYPAL_ACCOUNT.user, PAYPAL_ACCOUNT.password),
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'grant_type=client_credentials'
	};

	return new Promise((resolve, reject) => {
		request(options, (error, response, body) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(JSON.parse(body).access_token)
		});
	});
}

function getPayPalPayload(source, destination, amount, pluName, units) {
	return paymentDao.getAll().then(payments => {
		const sanitizedPayer = { email: source.email };
		const sanitizedPayee = { email: destination.email };

		const invoiceNumber = (payments.length + 1 + "").padStart(11, '0')
		const total = clientUtils.getDollarCents(amount);
		const payload = {
			...PAYPAL_BASE_PAY_CONFIG,
	  		"intent": "sale",
	  		"payer": {
			    "payment_method": "paypal",
			    payer_info: { ...sanitizedPayer }
			},
	  		"transactions": [
	  			{
			      "amount": {
			        "total": total,
			        "currency": "USD",
			        "details": {
			          "subtotal": total,
			          "tax": "0.00",
			          "shipping": "0.00",
			          "handling_fee": "0.00",
			          "shipping_discount": "0.00",
			          "insurance": "0.00"
			        }
			      },
			      "payee": sanitizedPayee,
			      "description": `Thank you for your purchase of ${units} of ${pluName}`,
			      "custom": "",
			      "invoice_number": invoiceNumber,
			      "payment_options": {
			        "allowed_payment_method": "INSTANT_FUNDING_SOURCE"
			      },
			      "soft_descriptor": "ECHI5786786",
			      "item_list": {
			        "items": [
			          {
			            "name": pluName,
			            "description": `the price is for ${units}`,
			            "quantity": 1,
			            "price": clientUtils.getDollarCents(total),
			            "tax": "0.01",
			            "sku": "1",
			            "currency": "USD"
			          }
			        ],
			        "shipping_address": {
			          "recipient_name": "Pantry User",
			          "line1": "610 Arcadia Terrace",
			          "line2": "Unit #301",
			          "city": "Sunnyvale",
			          "country_code": "US",
			          "postal_code": "94085",
			          "phone": "011862212345678",
			          "state": "CA"
			        }
			      }
			    }
		    ]
		};

		return payload;
	});
}