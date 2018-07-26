// Forward Azure Monitor Logs to Syslog (via Event Hub)
// Developed as a sample for testing purpuses
// https://github.com/miguelangelopereira/azuremonitor2syslog
// miguelp@microsoft.com

module.exports = function (context, myEventHubMessage) {
    // initializing syslog
    var syslog = require("syslog-client");

    // getting environment variables
    var SYSLOG_SERVER = GetEnvironmentVariable("SYSLOG_SERVER");
    var SYSLOG_PROTOCOL;
    if (GetEnvironmentVariable("SYSLOG_PROTOCOL")=="TCP") {
        SYSLOG_PROTOCOL = syslog.Transport.Tcp;
    } else {
        SYSLOG_PROTOCOL = syslog.Transport.Udp;
    }

    var SYSLOG_HOSTNAME;
    if (GetEnvironmentVariable("SYSLOG_HOSTNAME")=="") {
        SYSLOG_HOSTNAME = "azurefunction"
    } else {
        SYSLOG_HOSTNAME = GetEnvironmentVariable("SYSLOG_HOSTNAME");
    }

    var SYSLOG_PORT = parseInt(GetEnvironmentVariable("SYSLOG_PORT"));

    // options for syslog connection
    var options = {
        syslogHostname: SYSLOG_HOSTNAME,
        transport: SYSLOG_PROTOCOL,    
        port: 1000
    };

    // log connection variables
    context.log('SYSLOG Server: ', SYSLOG_SERVER);
    context.log('SYSLOG Port: ', SYSLOG_PORT);
    context.log('SYSLOG Protocol: ', SYSLOG_PROTOCOL);
    context.log('SYSLOG Hostname: ', SYSLOG_HOSTNAME);

    // log received message from event hub
    context.log('Event Hubs trigger function processed message: ', myEventHubMessage);
    context.log('EnqueuedTimeUtc =', context.bindingData.enqueuedTimeUtc);
    context.log('SequenceNumber =', context.bindingData.sequenceNumber);
    context.log('Offset =', context.bindingData.offset);
    
    // create syslog client
    var client = syslog.createClient(SYSLOG_SERVER, options);

    // cycle through eventhub messages and send syslog
    for(var i = 0; i < myEventHubMessage.records.length; i++) {
        var l = myEventHubMessage.records[i];
        client.log(JSON.stringify(l), options, function(error) {
            if (error) {
                context.log(error);
            } else {
                context.log("sent message successfully");
            }
}       );
    }
      

    context.done();
};

function GetEnvironmentVariable(name)
{
    return name + ": " + process.env[name];
}