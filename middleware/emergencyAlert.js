/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************

    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

var Fs = require('fs');
var Admins = require('../config/administrators.json');
var Message = require('../model/message');
var NotifyAdmin = require('./notifyAdmin');
var Scheduler = require('./cronjob');
var Config = require('../config');
var NotifyUser = require('./notifyUser');


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
    self.from = request.query.SmsSid ? "+"+request.query.From || "" : request.query.From || "";
    self.messageBody = request.query.Body || "";
    self.isViaSms = request.query.SmsSid || false;
    self.messageCount = 0;
    self.process = '';
    self.feedBack = {};
    console.log("1:::"+self.from);
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
    var msgbodyLower = msgbody.toLowerCase();
    // Filter message content
    // Start sending only if message content match keyword
    // @keyword emergency and @var self.messageCount <=0
    if(~msgbodyLower.indexOf('emergency')){
        if(self.messageCount<=0){
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
                        notify_url: Config.NOTIFY_URL_PARAMS+msgid,
                        rescued_url: Config.RESCUED_CONFIRM_URL_PARAMS+msgid
                    };

                    // Send sms to staff in Layer 1
                    var notify = new NotifyAdmin({layer: 'layer1'}, messageToSend);
                    notify.send().then(function(status_notify){

                        // Notify sender user
                        if(status_notify.sendSuccess > 0){

                            //# Create schedule task to check message by _id
                            //# and determine whether staffs had notified or aware
                            //# about emergency text SMS, base on notifyStatus field
                            var job = new Scheduler(msgid, Config.scheduleTaskDelay);

                            self.feedBack.code = 200;
                            self.feedBack.message = "Please stay calm, we will reaching you in just short time";
                            // Vis SMS if was sent via sms
                            if(self.isViaSms !== false){
                                var userNotifyStatus = new NotifyUser(self.from, self.feedBack.message);
                                userNotifyStatus.send().then(function(status){
                                    console.log("STATUS : "+status);
                                    resolve(self.feedBack)
                                });
                            }else{ // Via other method (push notification .etc)
                                resolve(self.feedBack);
                            }

                        }else{

                            self.forwardMessage();
                        }

                    });

                });
            });
        }else{
            // message already save once
            return new Promise(function(resolve, reject){
                self.feedBack.code = 300;
                self.feedBack.message = "We already received your message, keep calm we will reaching you soon";

                // Vis SMS if was sent via sms
                if(self.isViaSms !== false){
                    console.log(self.from);
                    var userNotifyStatus = new NotifyUser(self.from, self.feedBack.message);
                    userNotifyStatus.send().then(function(status){
                        resolve(self.feedBack)
                    });
                }else{ // Via other method (push notification .etc)
                    resolve(self.feedBack);
                }
            });
        }
    }else{

        // Not emergency message or maybe message already save once
        return new Promise(function(resolve, reject){
            self.feedBack.code = 403;
            self.feedBack.message = "You don't have permission to access this!";

            resolve(self.feedBack);
        });

    }
};

module.exports = EmergencyAlert;
