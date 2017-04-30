var mongoose = require('mongoose');
var database = require('../config/database.json');
var config = require('../config');


/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Create connection to mongoDB, use mongoose library    ***
    *** @param databaseName                                   ***
    *** @Return connection                                    ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

exports.getConnection = function(databaseName){
    var connection = mongoose.createConnection(process.env.MONGODB_URI);
    return connection;
}
