import express from 'express';
import config from '../config';
import UserService from '../services/userService';
import jwt from 'jsonwebtoken';

export default function(userCollection) {

	var router = express.Router();
	var userService = UserService(userCollection);

    router.post('/', function registerUser(req, res) {
        userService.createUser(req.body.username, req.body.password).then(
            function userCreated(user) {
                let token = jwt.sign(user, config.secret);
                res.status(200).json({'token': token});
            },
            function rejectedCreatingUser(err) {
                console.error(err);
                res.status(err.code).json({
                    error: err.code,
                    message: err.message
                });
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
