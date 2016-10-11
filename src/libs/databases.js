import Mongo from 'mongodb';
import config from '../config';

let client = Mongo.MongoClient;

export default function() {
	return new Promise(function(resolve, reject) {
		client.connect(config.DB_AUTH, function(err, db) {
			if (err) {
				reject(err);
				return;
			}

			resolve(db);
		});
	});
}
