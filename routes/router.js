var path = require('path');
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

  router.get('/', function(request, response, next){
    response.status(200);
    response.render('index', {} );
  });

  router.get('/emergency_request', messageController.emergency_request);

  router.get('/get_messages', messageController.get_messages);
  router.get('/get_message', messageController.get);
  router.get('/remove_messages', messageController.remove_messages);

  router.get('/notified_confirm', messageController.response_to_msg);

  router.get('/rescued_confirm', messageController.rescued_confirmation);

};
