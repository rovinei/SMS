
var messageController = require('../controllers/messageController');
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    *************************************************************
    ***                                                       ***
    *** Expressjs router
    *** All accepted request uri and request verb define here ***
    *** Map routes to controller functions                    ***
    ***                                                       ***
    *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

module.exports = function(router) {

  router.get('/', function(){
    response.status(200);
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  router.get('/incomemsg', messageController.emergency_request);

  router.get('/getmessages', messageController.get_messages);

  router.get('/notified', messageController.response_to_msg);

  router.get('/removemessages', messageController.remove_messages);

};