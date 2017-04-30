var mongoose = require('mongoose');
var Database = require('../database/connect');
// const assert = require('assert');
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Schema of message model                               ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

const MessageSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    notifyStatus: {
        type: Boolean,
        default: false
    },
    reachLayer: {
        type: String,
        default: "1"
    },
    body: {
        type: String
    },
    from: {
        type: String
    },
    completed: {
        type: Boolean,
        default: false
    }
});


// Obtain connection to database
var connection = Database.getConnection('messages');
var Message = connection.model('Message', MessageSchema);




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Iterate messages record before presentation           ***
    *** @param data => array object of messages               ***
    *** @Return Array object of messages                      ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function iterateMessage(data){
    var messages = [];
    data.forEach(function(message){
        var record = {};
        record['_id'] = message._id;
        record['timestamp'] = message.timestamp;
        record['notifyStatus'] = message.notifyStatus;
        record['reachLayer'] = message.reachLayer;
        record['completed'] = message.completed;
        record['body'] = message.body;
        record['from'] = message.from;
        messages.push(record);
    });

    return messages;
}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Function HandleError()                                ***
    *** log error param                                       ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function handleError(error) {
  console.error(`Error ${error}\n${error.stack}`);
}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Insert new message record to collection model         ***
    *** @param message => message data object                 ***
    *** @param callback => callback function                  ***
    *** @Return callback(message id)                          ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var insert = function(message, callback, retry=0){
    var retry = retry;
    // Self execute function
    (function exec(msg, cb){
        var instance = new Message({
            body: message.body,
            from: message.from
        });

        // save record
        var promise = instance.save();

        // return promise from save()
        promise.then(function(doc){
            callback(doc._id);
        }).catch(function(error){

            // Error saving record
            // Recursive technique try to save record again
            retry++;
            handleError(error);
            if(retry<3){
                exec(message, callback, retry);
            }else{
                callback(error);
            }
        });
    })();
};





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Get list of all messages record                       ***
    *** @Return callback(messages)                            ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var get_lists = function(callback){

    var messageData = Message.find({}).exec();
    messageData.then(function(messages){
        callback(messages);
    }).catch(function(err){
        handleError(err);
        callback({error: err});
    });

}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Get message by given message id                       ***
    *** @param msgid => message id                            ***
    *** @param callback => callback function                  ***
    *** @Return callback(message)                             ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var get_by_id = function(msgid, callback){
    (function(id, cb){
        Message.findById(msgid, function(err, message){
            if(err){
                handleError(err);
                exec(msgid, callback);
            }
            callback(message);
        });
    })();
}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Query messages record base on query criteria          ***
    *** @param query => query object {key:value}              ***
    *** @param callback => callback function                  ***
    *** @Return callback(messages)                            ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var query_by = function(query,callback){
    var messages = Message.find(query).exec();
    messages.then(function(messages){
        callback(messages);
    }).catch(function(err){
        handleError(err);
        callback({error: err});
    });
}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Query messages match by query criteria object         ***
    *** @param query => query object {key:value}              ***
    *** @param callback => callback function                  ***
    *** @Return callback(number of counted messages)          ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var count_query = function(query, callback){
    (function exec(q, cb){
        Message.find(query).count(function(err, count){
            if(err){
                handleError(err);
                exec(query, callback);
            }

            callback(null, count);
        });
    })();
}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Update message match by query to new value of @param  ***
    *** data                                                  ***
    *** @param msgid => query object {key:value}              ***
    *** or {_id:value}                                        ***
    *** @param data => new data object {key:value} to set     ***
    *** @param callback => callback function                  ***
    *** @Return callback(err, updated record)                 ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var update = function(msgid, data, callback){
    Message.findOneAndUpdate(msgid, {$set: data}, {new:true}, function(err, updatedRecord){
        if(err){
            handleError(err);
            callback(err,null);
        };
        callback(null,updatedRecord);
    });
}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Remove messages match with query                      ***
    *** @param query => query object {key:value}              ***
    *** @param callback => callback function                  ***
    *** @Return callback(removed record object)               ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var remove = function(query, callback){
    Message.remove(query, function(err, done){
        if(err){handleError(err);};
        callback(err, done);
    });
}

module.exports = {
    insert: insert,
    get_lists: get_lists,
    get_by_id: get_by_id,
    query_by: query_by,
    count_query: count_query,
    update: update,
    remove: remove
}
