import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import config from './config';
import authHelper from './helpers/authHelper';
import openDatabase from './libs/databases';
import allowCrossDomain from './libs/corsHelper';
import loginRoute from './routes/login';
import registerRoute from './routes/register';
import bookRoute from './routes/book';


function startServer(db) {
	let app = express(),
    server;

	app.use(bodyParser.json());

	// Allow Cross Domain Queries
	app.use('/', allowCrossDomain);

    // JWT filter copy paste from API Admin plus unless /toekn
    app.use(jwt({
        secret: config.secret,
        getToken: authHelper.getToken
    }).unless({path: ['/login', '/register']}));
    app.use(authHelper.handleUnauthorizedRequest);

	// End points
	app.use('/login', loginRoute(db.collection(config.USER_COLLECTION)));
    app.use('/register', registerRoute(db.collection(config.USER_COLLECTION)));
    app.use('/book', bookRoute(db.collection(config.BOOK_COLLECTION)));

	server = app.listen(process.env.PORT || 3993, function started() {
		console.info('Express server listening on Port ' + server.address().port);
	});
}

openDatabase().then(
	function fulfilled(db) {
		startServer(db);
	},
	function rejected(err) {
		console.error('Error open Mongo', err);
	}
);
