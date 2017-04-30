var admins = require('../config/administrators.json');
var twilioClient = require('../twilioClient');




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Class notifySms                                       ***
    *** Accept Construtor Argument                            ***
    *** @param people => String, Array, Object {layer:Number} ***
    *** @param messageTosend => Object                        ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function notifySms(people, messageToSend){
    var self = this;
    self.messageToSend = self.formatMessage(messageToSend);
    self.sendTo = [];

    // Determine the primitive type of @param people
    var objType = (typeof(people) == 'object' && people instanceof Array) ? 'array' : typeof(people);
    switch(objType){
        case 'string':
            self.sendTo.push(people);
            break;

        case 'array':
            self.sendTo = people;
            break;

        case 'object':
            for(prop in people){
                if(prop == 'layer'){
                    admins[people.layer].forEach(function(admin){
                        self.sendTo.push(admin.phoneNumber);
                    });
                    continue;
                }

                self.sendTo.push(people[prop]);
            }
            break;

        default:
            self.sendTo.push('+85516630095');
            break;
    }


}

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Function to render a template before send SMS         ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
notifySms.prototype.formatMessage = function(message) {
  return '\n\rNeed Emergency Help\n\r'+
        '\n\rSender :'+message.sender+
        '\n\rClick link below [Notify URL] to note that you have receive sms ==>'+
        '\n\rNotify URL :'+message.notifyurl+
        '\n\rMap URL :'+message.mapurl+
        '\n\rMessage :'+message.body+
        '\n\rLayer :'+message.layer;
};





/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Funtion for notify to responsible staffs              ***
    *** Iterate through number of admin in specific layer     ***
    *** Send SMS to each staff number                         ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
notifySms.prototype.send = function(){

    var self = this;
    self.feedback = {
        sendSuccess: 0,
        sendFailed: 0
    };
    return new Promise(function(resolve, reject){
        self.sendTo.forEach(function(phoneNumber) {
            twilioClient.sendSms(phoneNumber, self.messageToSend, function(status){
                if(status){
                    self.feedback.sendSuccess++;
                }else{
                    self.feedback.sendFailed++;
                }
            });
        });

        resolve(self.feedback);
    });
};

module.exports = notifySms;
