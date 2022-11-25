/**
 * Request handlers
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

// Define the handlers
var handlers = {};

// Users Handler
handlers.users = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback)
    } else {
        callback(405)
    }
};

// Users Handlers submethods
handlers._users = {}

// Users - Post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
    // check that all required fields are filled out
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesnt already exist
        var isExists = _data.isExistsFile('users', phone);

        if (!isExists) {
            //Hash the password
            var hashedPassword = helpers.hash(password);

            if (hashedPassword) {
                // Create the user object
                var userObject = {
                    firstName,
                    lastName,
                    phone,
                    hashedPassword,
                    tosAgreement
                }

                // Store user
                _data.create('users', phone, userObject, function (err) {
                    if (!err) {
                        callback(200)
                    } else {
                        console.log(`Could not create the new user ${err}`);
                        callback(500, { message: 'Could not create the new user' });
                    }
                });
            } else {
                callback(500, { message: 'Could not hash the user\'s password' });
            }
        } else {
            // User already exists
            callback(400, { message: 'A user with that phone number already exists' });
        }
    } else {
        callback(400, { message: 'missing required fields' });
    }
};

// Users - Get
// @TODO implements rule of get data of users
handlers._users.get = function (data, callback) {

};

// Users - Put
handlers._users.put = function (data, callback) {

};

// Users - Delete
handlers._users.delete = function (data, callback) {

};

// Ping Handler
handlers.ping = function (data, callback) {
    callback(200)
};

// Not Found Handlers
handlers.notFound = function (data, callback) {
    callback(404);
};

// Module to export
module.exports = handlers