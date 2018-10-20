const MongoClient = require('mongodb').MongoClient;
const dbUser = "herok_29hdwmh1_admin";
const dbPassword = "password2";
const dbName = 'heroku_29hdwmh1';
const url = `mongodb://${dbUser}:${dbPassword}@ds137483.mlab.com:37483/heroku_29hdwmh1`;

module.exports = class Dao {
	constructor(collection) {
		this.collection = collection;
	}

	get(id) {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, client) => {
				if (err) {
					reject(err);
					return;
				}

				console.log("Connected successfully to server");

				const db = client.db(dbName);

				const findDocuments = db => {
					// Get the documents collection
					const collection = db.collection(this.collection);

					// Find some documents
					collection.find({ id }).toArray(function(err, docs) {
						console.log("Found the following records");
						resolve(docs);
				 
						client.close();
					});
				};
				findDocuments(db);
			});
		});
	}

	getAll() {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, client) => {
				if (err) {
					reject(err);
					return;
				}

				console.log("Connected successfully to server");

				const db = client.db(dbName);

				const findDocuments = db => {
					// Get the documents collection

					const collection = db.collection(this.collection);

					// Find some documents
					collection.find({}).toArray(function(err, docs) {
						console.log("Found the following records");
						resolve(docs);
				 
						client.close();
					});
				};
				findDocuments(db);
			});
		});
	}

	filter(filters) {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, client) => {
				if (err) {
					reject(err);
					return;
				}

				console.log("Connected successfully to server");
			 
				const db = client.db(dbName);

				const findDocuments = db => {
					// Get the documents collection
					const collection = db.collection(this.collection);

					// Find some documents
					collection.find(filters).toArray(function(err, docs) {
						console.log("Found the following records");
						resolve(docs);
				 
						client.close();
					});
				};
				findDocuments(db);
			});
		});
	}

	create(elements) {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, client) => {
				if (err) {
					reject(err);
					return;
				}

				console.log("Connected successfully to server");
			 
				const db = client.db(dbName);

				const insert = db => {
					// Get the documents collection
					const collection = db.collection(this.collection);

					const res = collection.insertMany(elements, function(err, docs) {
						resolve(docs.ops);
				 
						client.close();
					});
				};
				insert(db);
			});
		});
	}

	update(id, properties) {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, client) => {
				if (err) {
					reject(err);
					return;
				}

				console.log("Connected successfully to server");
			 
				const db = client.db(dbName);

				const update = db => {
					// Get the documents collection
					const collection = db.collection(this.collection);

					// Find some documents
					collection.updateOne({ id }, { $set: properties }).toArray(function(err, docs) {
						resolve(docs);
				 
						client.close();
					});
				};

				update(db);
			});
		});
	}

	delete(id) {
		return new Promise((resolve, reject) => {
			MongoClient.connect(url, (err, client) => {
				if (err) {
					reject(err);
					return;
				}

				console.log("Connected successfully to server");
			 
				const db = client.db(dbName);

				const updateDocument = db => {
					// Get the documents collection
					const collection = db.collection(this.collection);

					// Find some documents
					collection.updateOne({ id }, { $set: { deleted: true } }).toArray(function(err, docs) {
						console.log("Found the following records");
						resolve(docs);
				 
						client.close();
					});
				};
				updateDocument(db);
			});
		});
	}
}



