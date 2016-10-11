import cryptography from '../libs/cryptography';

export default function userService(userCollection) {

    function mongoError(err) {
        err = err || {}; // Pending to thing about error codes
        err.code = 500;
        err.message = 'Mongo Error';
        return err;
    }

    function notFoundError(err) {
        err = err || {}; // Pending to thing about error codes
        err.code = 404;
        err.message = 'User not found';
        return err;
    }

    function passwordError(err) {
        err = err || {}; // Pending to thing about error codes
        err.code = 422;
        err.message = 'User and password do not match';
        return err;
    }

    function findUserById(username) {
        return new Promise(function findUserByIdPromise(resolve, reject) {
            userCollection.aggregate([
                    {
                        '$match': {_id: username}
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'username': '$_id',
                            'password': 1,
                            'avatar': 1,
                            'displayname': 1,
                            'services': 1
                        }
                    }
                ],
                function findUser(err, data) {
                    if (err || !data || !data.length) {
                        reject(err);
                    }
                    else {
                        resolve(data[0]);
                    }
                }
            );
        });
    }

    function getUser(username) {

    }

    function createUser(username, password) {
        return new Promise(function(resolve, reject) {
            cryptography.generateHash(password).then(
                function fulfilledHash(hash) {
                    userCollection.insertOne({
                        _id: username,
                        password: hash,
                        displayname: username,
                        avatar: 'http://www.esp8266.com/images/user4.png',
                        services: {
                            authentication: 'user', // admin | staf | user ¿?
                            web: 'user',
                            api: 'user'
                        }
                    })
                    .then(
                        function fulfilledInsert(operation) {
                            if (operation && operation.result && operation.result.ok) {
                                let user = operation.ops[0];
                                user.username = user._id;
                                delete user._id;
                                delete user.password;
                                resolve(user);
                                return;
                            }

                            reject({
                                code: 500,
                                message: 'Error: user not saved in mongo'
                            });
                        },
                        function rejectedInsert(err) {
                            err = err || {}; // Pending to thing about error codes
                            err.code = 409;
                            err.message = 'User already exists';
                            reject(err);
                        }
                    ).catch(function errorMongo(err) {
                        reject(mongoError(err));
                    });
                },
                function rejectedHash(err) {
                    console.log('Error', err);
                    err = err || {}; // Pending to thing about error codes
                    err.code = 412;
                    err.message = 'Error generating hash';
                    reject(err);
                }
            ).catch(function errorMongo(err) {
                reject(mongoError(err));
            });
        });
    }

    function updateUser(username, password) {

    }

    function checkPassword(username, password) {
        return new Promise(function checkPasswordPromise(resolve, reject) {
            findUserById(username).then(
                function userFound(user) {
                    cryptography.compareHash(password, user.password).then(
                        function passwordChecked(isOk) {
                            if (isOk) {
                                delete user.password;
                                resolve(user);
                                return;
                            }
                            reject(passwordError());
                        }
                    ).catch(function passwordErrorPromise(err) {
                        reject(passwordError());
                    });
                },
                function userNotFound(err) {
                    reject(notFoundError(err));
                }
            ).catch(function userNotFound(err) {
                reject(notFoundError(err));
            });
        });
    }

	return {
		getUser: getUser,
        createUser: createUser,
        updateUser: updateUser,
        checkPassword: checkPassword
	};
}
