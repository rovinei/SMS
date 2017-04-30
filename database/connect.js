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
    var connection = mongoose.createConnection("mongodb://127.0.0.1/"+databaseName);
    return connection;
}
