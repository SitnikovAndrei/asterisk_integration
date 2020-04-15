const fs = require('fs');
let CallEventDTO = require("../dto/CallEventDTO");

class EventHandler {
    cache = {};

    constructor(messageWsService) {
        this.messageWsService = messageWsService;
    }

    eventTypeFilter = (event) => {
        let type = event.Event;
        return !(type === "DialBegin" || type === "DialEnd" || type === "SoftHangupRequest");
    }

    isInbound = (event) => {
        return event.CallerIDNum.length >= 11;
    }

    toCallEventConvert = (event) => {
        let type = event.Event;
        let linkedId = event.Linkedid;
        let prevCallEvent = this.cache[linkedId];
        let callerIdNum = event.CallerIDNum;
        let exten = event.Exten;

        if (type == "DialBegin") {
            let dialString = event.DialString;
            let _isInbound = this.isInbound(event);
            let callType = _isInbound ? "inbound" : "outbound";
            let toNumber = _isInbound ? event.DialString : event.Exten;
            let lineNumber = _isInbound ? exten : null;
            let callEvent = new CallEventDTO({
                "contextId": linkedId,
                "fromNumber": callerIdNum,
                "toNumber": toNumber,
                "state": "appeared",
                "lineNumber": lineNumber,
                "callType": callType
            });
            this.cache[linkedId] = callEvent;
            return callEvent
        }

        if (type == "DialEnd") {
            let status = (event.DialStatus == "ANSWER") ? "connected" : "disconnected";
            let callType = prevCallEvent.callType;
            let toNumber = prevCallEvent.toNumber;
            let lineNumber = prevCallEvent.lineNumber;
            let callEvent = new CallEventDTO({
                "contextId": linkedId,
                "fromNumber": callerIdNum,
                "toNumber": toNumber,
                "state": status,
                "lineNumber": lineNumber,
                "callType": callType
            });
            this.cache[linkedId] = callEvent;
            return callEvent;
        }

        if (type == "SoftHangupRequest") {
            let callType = prevCallEvent.callType;
            let toNumber = prevCallEvent.toNumber;
            let lineNumber = prevCallEvent.lineNumber;
            let prevState = prevCallEvent.state;
            this.cache[linkedId] = null;
            if (prevState == "disconnected") return null;

            return new CallEventDTO({
                "contextId": linkedId,
                "fromNumber": callerIdNum,
                "toNumber": toNumber,
                "state": "disconnected",
                "lineNumber": lineNumber,
                "callType": callType
            });
        }
    }

    handle = (event) => {
        if (this.eventTypeFilter(event)) return;
        let call = this.toCallEventConvert(event);
        if (call == null) return;
        this.messageWsService.sendJsonMessage("1001", call);
    }
}

module.exports = EventHandler;