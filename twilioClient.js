var config = require('./config');
var client = require('twilio')(config.accountSid, config.authToken);




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Twilio send SMS API function                          ***
    *** Accept arguments                                      ***
    *** @param to => receiver mobile number                   ***
    *** @param message => message content                     ***
    *** @param callback => callback function(boolean)         ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

module.exports.sendSms = function(to, message, callback) {
client.messages.create({
    body: message,
    to: to,
    from: config.sendingNumber
//  mediaUrl: imageUrl
  }, function(err, data) {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  });
};
