/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************

    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var Fs = require('fs');
var Admins = require('../config/administrators.json');
var Message = require('../model/message');
var NotifyAdmin = require('./notifyAdmin');
var Scheduler = require('../middleware/cronjob');
var Config = require('../config');





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Class EmergencyAlert                                  ***
    *** Accept Contrutor Argument                             ***
    *** @Request object from controller                       ***
    *** @Response object from controller                      ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function EmergencyAlert(request, response){
    var self = this;
    self.request = request;
    self.response = response;
    self.from = request.query.From || "";
    self.messageBody = request.query.Body || "";
    self.messageCount = 0;
    self.process = '';
    self.feedBack = {};
}

EmergencyAlert.prototype.start = function(){
    var self = this;
    // Start sending SMS after instantiate an object
    return new Promise(function(resolve, reject){
        self.handleUserMultipleRequest({from:self.from, completed:false}, function(){
        var result = self.forwardMessage();
            result.then(function(feedback){
                resolve(feedback);
            });
        });
    });
}


/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Function to return the feedback object                ***
    *** @Return this.feedBack                                 ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
EmergencyAlert.prototype.getFeedBack = function(){
    var self = this;
    return self.feedBack;
};




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Detect whether user try to send SMS multi             ***
    *** To avoid of incoming SMS overloading                  ***
    *** Send SMS only for the fisrt request                   ***
    *** @Return callback function                             ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

EmergencyAlert.prototype.handleUserMultipleRequest = function(query, callback){
    var self = this;

    Message.count_query(query, function(err, count){
        if(err){
            self.feedBack.handleUserMultipleRequestError = err;
        }else{
            self.messageCount = count;
        }
        callback();
    });
};




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Function to forward SMS from twilio weebhook,         ***
    *** Also accept direct request                            ***
    *** Request must have params:                             ***
    ***     @param From                                       ***
    ***     @param Body                                       ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

EmergencyAlert.prototype.forwardMessage = function() {
    var self = this;
    var msgbody = self.messageBody;

    // Filter message content
    // Start sending only if message content match keyword
    // @keyword emergency and @var self.messageCount <=0
    if(~msgbody.indexOf('emergency') && self.messageCount<=0){
        var data = {
            body: self.messageBody,
            from: self.from
        };

        return new Promise(function(resolve, reject){
            // Insert message record as reference
            Message.insert(data, function(msgid){
                var messageToSend = {
                    sender: self.from,
                    body: self.messageBody,
                    notify_url: 'https://emergencysms.herokuapp.com/notified_confirm?msgid='+msgid,
                    rescued_url: 'https://emergencysms.herokuapp.com/rescued_confirm?msgid='+msgid
                };

                // Send sms to staff in Layer 1
                var notify = new NotifyAdmin({layer: 'layer1'}, messageToSend);
                notify.send().then(function(status_notify){
                    self.feedBack.status = status_notify;
                    //# Create schedule task to check message by _id
                    //# and determine whether staffs had notified or aware
                    //# about emergency text SMS, base on notifyStatus field
                    var job = new Scheduler(msgid, Config.scheduleTaskDelay);
                    self.feedBack.record = msgid;
                    resolve(self.feedBack);
                });

            });
        });
    }else{

        // Not emergency message or maybe message already save once
        return new Promise(function(resolve, reject){
            self.feedBack.result = "Not emergency message!\nOr message is already save once.";
            resolve(self.feedBack);
        });

    }
};

module.exports = EmergencyAlert;
