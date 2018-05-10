const fs = require('fs');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const basicAuth = require('basic-auth');
const server = jsonServer.create();
const router = jsonServer.router(__dirname + '/database.json');
const userdb = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'UTF-8'));

server.use(jsonServer.defaults());


const SECRET_KEY = '123456789';

const expiresIn = '1h';

// Create a token from a payload
function createToken(payload) {
    return jwt.sign(payload, SECRET_KEY);
}

// Verify the token
function verifyToken(token) {
    var decodedToken = jwt.decode(token)
    return userdb.users.filter(user => user.name == decodedToken).length > 0;
}

// Check if the user exists in database
function isAuthenticated(username, password) {

    var userIndex = userdb.users.findIndex(function (user) {
        return (user.name === username && user.password === password);
    });

    return userIndex != -1;
}


server.use(jsonServer.defaults());

server.post('/auth/login', function (req, res) {
    var credentials = basicAuth(req),
        username = credentials.user || credentials.username || credentials.name,
        password = credentials.password || credentials.pass;
    if (!isAuthenticated(username, password)) {
        const status = 401;
        const message = 'Incorrect username or password';
        res.status(status).json({status, message});
        return
    }
    const access_token = createToken(username, password);
    res.status(200).json({access_token})
});

server.use(/^(?!(\/auth|\/no-auth)).*$/, function (req, res, next) {
    console.log("no-auth 1");
    var status, message;
    if (!req.headers.authorization) {
        status = 401;
        message = 'Error in authorization format';
        return res.status(status).json({status, message});
    } else if (req.headers.authorization.split(' ')[0] == 'Bearer' && !verifyToken(req.headers.authorization.split(' ')[1])) {
        status = 401;
        message = 'Invalid acces_token';
        return res.status(status).json({status, message});
    } else if (req.headers.authorization.split(' ')[0] == 'Basic') {
        var credentials = basicAuth(req),
            username = credentials.user || credentials.username || credentials.name,
            password = credentials.password || credentials.pass;
        if (!isAuthenticated(username, password)) {
            status = 401;
            message = 'Incorrect username or password';
            return res.status(status).json({status, message});
        }
    }
    next();
});

server.use('/no-auth', router);

server.use(router);

server.listen(5000, function () {
    console.log('API Server started on port:' + 5000)
});