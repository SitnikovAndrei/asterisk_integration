const fs = require('fs');
let CallEventDTO = require("../dto/CallEventDTO");

class EventHandler {
    cache = {};

    constructor(messageWsService) {
        this.messageWsService = messageWsService;
    }

    eventTypeFilter = (event) => {
        let type = event.Event;
        return !(type === "DialBegin" || type === "DialEnd" || type === "Hangup");
    }

    /**
     * @param {string} number
     * @returns {boolean}
     */
    isInbound = (number) => {
        return number.length >= 11;
    }
    /**
     * @param {string} fromNumber
     * @param {string} toNumber
     * @returns {boolean}
     */
    isInternal = (fromNumber, toNumber) => {
        return fromNumber.length < 11 && toNumber.length < 11;
    }

    toCallEventConvert = (event) => {
        let type = event.Event;
        let linkedId = event.Linkedid;
        let uniqueId = event.Uniqueid;
        let destUniqueId = event.DestUniqueid;
        let destCallerIdNum = event.DestCallerIDNum
        let callerIdNum = event.CallerIDNum;
        let exten = event.Exten;

        if (type == "DialBegin") {
            if (callerIdNum == null) callerIdNum = destCallerIdNum;
            // console.log(event);
            let dialString = event.DialString.replace(/.*\//, "");
            let _isInbound = this.isInbound(callerIdNum);
            let callType = _isInbound ? "inbound" : "outbound";
            let toNumber = (_isInbound || event.Exten == null) ? dialString : event.Exten;
            let lineNumber = _isInbound ? exten : null;

            console.log(`DialBegin: ${destUniqueId} | ${callerIdNum} | ${toNumber} | ${callType}`);
            if (this.isInternal(callerIdNum, toNumber)) return;
            let callEvent = new CallEventDTO({
                "callId": destUniqueId,
                "fromNumber": callerIdNum,
                "toNumber": toNumber,
                "state": "appeared",
                "lineNumber": lineNumber,
                "callType": callType,
                "location": "abonent"
            });
            this.cache[destUniqueId] = callEvent;
            return callEvent
        }

        if (type == "DialEnd") {
            console.log(`DialEnd: ${destUniqueId}`);
            let prevCallEvent = this.cache[destUniqueId];
            if (prevCallEvent == null) return;

            let prevState = prevCallEvent.state;
            if (prevState == "disconnected") return;

            let status = (event.DialStatus == "ANSWER") ? "connected" : "disconnected";
            let callType = prevCallEvent.callType;
            let fromNumber = prevCallEvent.fromNumber;
            let toNumber = prevCallEvent.toNumber;
            let lineNumber = prevCallEvent.lineNumber;
            let callEvent = new CallEventDTO({
                "callId": destUniqueId,
                "fromNumber": fromNumber,
                "toNumber": toNumber,
                "state": status,
                "lineNumber": lineNumber,
                "callType": callType,
                "location": "abonent"
            });
            this.cache[destUniqueId] = callEvent;
            return callEvent;
        }

        if (type == "Hangup") {
            console.log(`Hangup: ${uniqueId}`);
            let prevCallEvent = this.cache[uniqueId];
            if (prevCallEvent == null) return;
            let callType = prevCallEvent.callType;
            let fromNumber = prevCallEvent.fromNumber;
            let toNumber = prevCallEvent.toNumber;
            let lineNumber = prevCallEvent.lineNumber;
            let prevState = prevCallEvent.state;
            this.cache[uniqueId] = null;
            if (prevState == "disconnected") return;

            return new CallEventDTO({
                "callId": uniqueId,
                "fromNumber": fromNumber,
                "toNumber": toNumber,
                "state": "disconnected",
                "lineNumber": lineNumber,
                "callType": callType,
                "location": "abonent"
            });
        }
    }

    handle = (event) => {
        fs.appendFileSync("logs.txt", new Date().toString() + " " + JSON.stringify(event) + "\r\n");
        if (this.eventTypeFilter(event)) return;
        let call = this.toCallEventConvert(event);
        if (call == null) return;
        let userExt = (call.callType == "inbound") ? call.toNumber : call.fromNumber;
        console.log(`send message userExt: ${userExt} | ${call.fromNumber} | ${call.toNumber} | state: ${call.state} | ${call.contextId}`);
        // fs.appendFileSync("logs.txt", new Date().toString() + " " + JSON.stringify(call) + "\r\n");
        this.messageWsService.sendJsonMessage(userExt, call);
    }
}

module.exports = EventHandler;