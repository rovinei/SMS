var Message = require('../model/message');
var EmergencyAlert = require('../middleware/emergencyAlert');
var SendSms = require('../sendSms');
var Config = require('../config');
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
    var notification = new EmergencyAlert(request, response);
    var promise = notification.start();
    promise.then(function(feedback){
        response.status(200);
        response.render('index', {feedback: feedback});
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
        response.render('message', {message: message});
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
        response.render('message_list', {messages: messages})
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
    if(request.query.msgid && request.query.msgid != ''){
        Message.update({_id:request.query.msgid},{notifyStatus:true},function(err, status){
            response.status(200);
            if(err){
                response.render('index',
                    {
                        feedback: {
                            code: 500,
                            message: "Cannot update message!<br> Please try again"
                        }
                    }
                );
            }else{
                response.render('index',
                    {
                        feedback: {
                            code: 200,
                            message: "Successfully notify to message"
                        }
                    }
                );
            }
        });
    }else{
        response.status(200);
        response.render('index',
            {
                feedback: {
                    code: 400,
                    message: "No message was found"
                }
            }
        );
    }
}




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** @GET request                                          ***

    *** @Return json(deleted record count)                    ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var rescued_confirmation = function(request, response, next){
    if(request.query.msgid && request.query.msgid != ''){
        Message.update({_id:request.query.msgid,notifyStatus:true},{completed:true},function(err, status){
            response.status(200);
            if(err){

                response.render('index',
                    {
                        feedback: {
                            code: 500,
                            message: "Cannot update message!<br> Please try again!"
                        }
                    }
                );
            }else{

                // Send confrimation to Mr.Somphea
                if(status != null){
                    SendSms(Config.RESCUED_CONFIRM_INCHARGE, "Rescued Confirm", function(){

                    });
                }
                response.render('index',
                    {
                        feedback: {
                            code: 200,
                            message: "Successfully updated rescued comfirmed"
                        }
                    }
                );
            }
        });
    }else{
        response.status(200);
        response.render('index',
            {
                feedback: {
                    code: 400,
                    message: "No message was found"
                }
            }
        );
    }
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
        response.render('index',
            {
                feedback: {
                    code: 200,
                    message: "Successfully removed all rescued messages record"
                }
            }
        );
    });
}

module.exports = {
    get : get,
    get_messages : get_messages,
    response_to_msg : response_to_msg,
    emergency_request: emergency_request,
    remove_messages : remove_messages,
    rescued_confirmation: rescued_confirmation,
}
