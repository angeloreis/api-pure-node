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
// Require data: phone
// optional data: none
// @TODO Only Authenticated user access their object, Don't let them acess anyone else's
handlers._users.get = function (data, callback) {
    // Check that the phone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                var newData = helpers.parseJsonToObject(data)
                // Remove the hashed password from the user object before returning it to requester
                delete newData.hashedPassword;
                callback(200, newData);
            } else {
                callback(404);
            }
        })
    } else {
        callback(400, { message: 'Missing required field' });
    }
};

// Users - Put
// Required data : phone
// Optional data : firstName, lastName, password (at least one must be specified)
// @TODO Only Authenticated user access their object, Don't let them acess anyone
handlers._users.put = function (data, callback) {
    // Check that the phone number is valid
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if the phone is sent to update
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    // Update the fields necessary
                    if (firstName) {
                        userData.firstName = firstName
                    }

                    if (lastName) {
                        userData.lastName = lastName
                    }

                    if (password) {
                        userData.password = helpers.hash(password)
                    }

                    // Store new updates
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {
                            callback(200)
                         } else {
                            callback(500, { message: "Couldn\'t update the user" })
                        }
                    })
                } else {
                    callback(400, { message: 'The specified user doesn\'t exist' });
                }
            });
        } else {
            callback(400, { message: 'Missing fields to update' });
        }
    } else {
        callback(400, { message: 'Missing required field' });
    }
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