'use strict';

var corsHelper =  function(req, res, next) {
    if ('OPTIONS' === req.method) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS,HEAD');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.sendStatus(200);
    }
    else {
        res.header('Access-Control-Allow-Origin', '*');
        next();
    }
};

module.exports = corsHelper;
