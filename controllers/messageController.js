var Message = require('../model/message');
var twilioNotifications = require('../middleware/twilioNotifications');


/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Emergency Request Controller
    *** Accept request uri \incomemgs?                        ***
    *** Accept direct request params must have:               ***
    ***     @param From                                       ***
    ***     @param Body                                       ***
    *** Accept webhook request params from twilio:            ***
    ***     @param [all params from twilio webhook]           ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var emergency_request = function(request, response, next){
    var notification = new twilioNotifications(request, response);
    var promise = notification.start();
    promise.then(function(feedback){
        response.status(200);
        response.json(feedback);
    });

}




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** @GET request
    *** Get a specific message record by id                   ***
    *** Accept request must have param:                       ***
    ***     @param msgid                                      ***
    *** @Return json(message)                                 ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
var get = function(request, response, next){
    var msgid = request.query.msgid || "";
    Message.get_by_id(msgid ,function(message){
        response.status(200);
        response.json(message);
    });
};





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** @GET request                                          ***
    *** Get all messages record                               ***
    *** @Return json(messages)                                ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var get_messages = function(request, response, next){
    Message.get_lists(function(messages){
        response.status(200);
        response.json(messages);
    });
}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** @GET request                                          ***
    *** Update a message @field statusNotify to true          ***
    *** Accept request must contain param:                    ***
    ***     @param msgid                                      ***
    *** @Return json(updated data & error)                    ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var response_to_msg = function(request, response, next){
    Message.update({_id:request.query.msgid},{notifyStatus:true},function(err, status){
        response.status(200);
        response.json({
            updated : status,
            error: err
        });
    });
}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** @GET request                                          ***
    *** Remove messages with {completed:true}              ***
    *** Remove messages with query match @param data          ***
    *** @notifyStatus = true, means emergency help completed  ***
    *** @Return json(deleted record count)                    ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var remove_messages = function(request, response, next){
    var query = {};
    if(request.query.data){
        query = request.query.data;
    }else{
        query = {completed:true};
    }
    Message.remove(query, function(err, status){
        response.status(200);
        response.json({
            updated: status.result,
            error: err
        });
    });
}

module.exports = {
    get : get,
    get_messages : get_messages,
    response_to_msg : response_to_msg,
    emergency_request: emergency_request,
    remove_messages : remove_messages,
}