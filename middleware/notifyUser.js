var sendSms = require('../sendSms');

function NotifyUser(phoneNumber, message){
    var self = this;
    self.phoneNumber = phoneNumber;
    self.message = message;
}

NotifyUser.prototype.send = function(){
    var self = this;
    return new Promise(function(resolve, reject){
        sendSms(self.phoneNumber, self.message , function(err, status){
            resolve(status);
        });
    });
}

module.exports = NotifyUser;
