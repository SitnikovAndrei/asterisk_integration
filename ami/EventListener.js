const fs = require('fs');
const SummaryDTO = require("../dto/SummaryDTO");
const MessageWsService = require("../ws/MessageWsService");
const EventConverter = require("../mapper/EventConverter");

class EventListener {
    /**
     * 
     * @param {MessageWsService} messageWsService 
     * @param {EventConverter} eventConverter 
     */
    constructor(messageWsService, eventConverter) {
        this.messageWsService = messageWsService;
        this.eventConverter = eventConverter;
    }

    filterByType = (event) => {
        let type = event.Event;
        return !(type === "DialBegin" || type === "DialEnd" || type === "Hangup" || type === "Newstate");
    }

    accept = (event) => {
        // fs.appendFileSync("logs.txt", new Date().toString() + " " + JSON.stringify(event) + "\r\n");
        if (this.filterByType(event)) return;
        let call = this.eventConverter.toCall(event);
        if (call == null) return;
        let userExt = (call.direction == "inbound") ? call.toNumber : call.fromNumber;
        
        console.log(`send message userExt: ${userExt} | ${call.fromNumber} | ${call.toNumber} | state: ${call.state} | ${call.contextId}`);
        fs.appendFileSync("logs.txt", new Date().toString() + " " + JSON.stringify(call) + "\r\n");
        this.messageWsService.sendJsonMessage(userExt, call);
    }
}

module.exports = EventListener;