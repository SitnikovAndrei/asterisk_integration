const fs = require('fs');
const SummaryDTO = require("../dto/SummaryDTO");
const MessageWsService = require("../ws/MessageWsService");
const EventConverter = require("../mapper/EventConverter");

class EventHandler {
    /**
     * 
     * @param {MessageWsService} messageWsService 
     * @param {EventConverter} EventConverter 
     */
    constructor(messageWsService, EventConverter) {
        this.messageWsService = messageWsService;
        this.EventConverter = EventConverter;
    }

    filter = (event) => {
        let type = event.Event;
        return !(type === "DialBegin" || type === "DialEnd" || type === "Hangup" || type === "Newstate");
    }

    handle = (event) => {
        // fs.appendFileSync("logs.txt", new Date().toString() + " " + JSON.stringify(event) + "\r\n");
        if (this.filter(event)) return;
        let call = this.EventConverter.toCall(event);
        if (call == null) return;
        let userExt = (call.direction == "inbound") ? call.toNumber : call.fromNumber;

        if (call instanceof Array){
            
        };
        console.log(`send message userExt: ${userExt} | ${call.fromNumber} | ${call.toNumber} | state: ${call.state} | ${call.contextId}`);
        fs.appendFileSync("logs.txt", new Date().toString() + " " + JSON.stringify(call) + "\r\n");
        this.messageWsService.sendJsonMessage(userExt, call);
    }
}

module.exports = EventHandler;