
var moment = require('moment-timezone');
var scheduler = require('node-schedule');


function convertTime(delay, date){
    return date + parseInt(delay);
}

module.exports = (function(){
    var date = Date.now();
    var exectime = moment().add(2, 'seconds');
    var delay = '2000';
    var timeExec = convertTime(delay, date);
    console.log("DATE :"+date);
    console.log("TIME EXE :"+timeExec);
    console.log("DATE NOW: "+date);
    console.log("MOMENT NOW: "+exectime.format());
    var job = scheduler.scheduleJob(timeExec, function(){
        console.log("executed : "+exectime.format());
    });
})();
