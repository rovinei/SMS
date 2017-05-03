
var moment = require('moment-timezone');
var scheduler = require('node-schedule');


function convertTime(delay){
    return Date.now() + parseInt(delay);
}

module.exports = (function(){
    var date = Date.now();
    var delay = '2000';
    var timeExec = convertTime(delay);
    console.log("DATE :"+date);
    console.log("TIME EXE :"+timeExec);
    var job = scheduler.scheduleJob(timeExec, function(){
        console.log("executed : "+timeExec);
    });
})();
