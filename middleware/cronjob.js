var schedule = require('node-schedule');
var Message = require('../model/message');
var notifySms = require('./notifySms');
var config = require('../config');




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    *** Class Scheduler                                       ***
    *** Set up task schedule                                  ***
    *** Accept Constructor Argument                           ***
    *** @param msgid => message id                            ***
    *** @param delay => number of millisecond to delay task   ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function Scheduler(msgid, delay){
    var self = this;
    self.msgid = msgid;
    self.date = new Date(Date.now()+delay);
    var job = schedule.scheduleJob(self.date, function(){
        console.log('CRON TASK IS CALLING :' +self.msgid);
        self.checkEmergencySmsRecord();
    });
}





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Function checkEmergencySmsRecord()                    ***
    *** to check emergency message and determine whether      ***
    *** staff had notified by SMS or not, base on @field      ***
    *** notifyStatus, if not false, create new cron task      ***
    *** for this specific message record, send to next        ***
    *** layer                                                 ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

Scheduler.prototype.checkEmergencySmsRecord = function(){
    var self = this;
    Message.get_by_id(self.msgid, function(message){

        // Check notifyStatus field
        if(message && message.notifyStatus == false){
            var layer = parseInt(message.reachLayer) == 3 ? '1' : parseInt(message.reachLayer)+1;
            Message.update({_id:message._id},{reachLayer:layer.toString()}, function(err, record){
            });

            // Create same message content format
            var messageToSend = {
                sender: message.from,
                body: message.body,
                notifyurl: 'https://emergencysms.herokuapp.com/notified?msgid='+message._id,
                mapurl: 'https://google.com/map',
                layer: layer.toString()
            };

            // Notify to next staff layer
            var notifyAdmin = new notifySms({layer: 'layer'+layer.toString()}, messageToSend);
            var status_notify = notifyAdmin.send();

            // Schedule task to check after 5 minute
            new Scheduler(self.msgid, config.scheduleTaskDelay);
            console.log("CRON JOB EXECUTED :"+self.msgid);
        }
    });
}

module.exports = Scheduler;
