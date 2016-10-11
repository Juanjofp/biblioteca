import express from 'express';
import config from '../config';
import UserService from '../services/userService';
import jwt from 'jsonwebtoken';

export default function(userCollection) {

	var router = express.Router();
	var userService = UserService(userCollection);

	router.post('/', function getToken(req, res) {
		userService.checkPassword(req.body.username, req.body.password).then(
            function fulfilled(user) {
                if (user) {
                    let token = jwt.sign(user, config.secret);
                    res.status(200).json({'token': token});
                    return;
                }
                res.status(400).json({'message': 'username or password are not valid'});
            },
            function rejected(err) {
                console.error(err);
                res.status(err.code).json(err);
            }
        ).catch(function(err) {
            console.error(err);
            err = err || {};
            err.code = 500;
            err.message = 'Unknown error';
            res.status(err.code).json(err);
        });
	});

	return router;
}
