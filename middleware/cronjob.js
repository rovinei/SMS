var schedule = require('node-schedule');
var Message = require('../model/message');
var NotifyAdmin = require('./notifyAdmin');
var Config = require('../config');





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
    self.delay = delay;
    self.timezone = "Asia/Phnom_Penh";
    self.executeDate = self.setTimeToExecute(self.delay);
    console.log('TIME DELAY :' +self.delay);
    console.log('CRON TASK IS SET :' +self.msgid);
    console.log('TIME EXECUTE :' +self.executeDate);
    self.task = schedule.scheduleJob(self.executeDate, function(){
        console.log('CRON TASK IS CALLING :' +self.msgid);
        self.checkEmergencySmsRecord();
    });
}






/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Function toTimeZone()                                 ***
    *** Convert datetime now of a server specific location    ***
    *** to Cambodia Phnom Penh datetime                       ***
    *** @Return datetime now in Asia/Phnom_Penh               ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

Scheduler.prototype.setTimeToExecute = function(delay) {
    return Date.now() + parseInt(delay);
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
                notify_url: 'https://emergencysms.herokuapp.com/notified_confirm?msgid='+message._id,
                rescued_url: 'https://emergencysms.herokuapp.com/rescued_confirm?msgid='+message._id
            };

            // Notify to next staff layer
            var notifyAdmin = new NotifyAdmin({layer: 'layer'+layer.toString()}, messageToSend);
            var status_notify = notifyAdmin.send();

            // Schedule task to check after 5 minute
            self.task.cancel();
            var job = new Scheduler(self.msgid, Config.scheduleTaskDelay);
            console.log("CRON JOB EXECUTED :"+self.msgid);
        }else{
            self.task.cancel();
        }
    });
}

module.exports = Scheduler;
