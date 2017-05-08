var Config = require('./config');
var client = require('twilio')(Config.accountSid, Config.authToken);




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

module.exports = function(to, message, callback) {
client.messages.create({
    body: message,
    to: to,
    from: Config.sendingNumber
//  mediaUrl: imageUrl
  }, function(err) {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  });
};
