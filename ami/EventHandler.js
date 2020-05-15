const fs = require('fs');
// const EventHandler = require("./EventHandler");
const CallDTO = require("../dto/CallDTO");
const ContextDTO = require("../dto/ContextDTO");

class EventHandler {
    callCache = {}
    contextCache = {}

    constructor(messageWsService) {
        this.messageWsService = messageWsService;
    }

    writeLog(event){
        fs.appendFileSync("logs.txt", new Date().toString() + " " + JSON.stringify(event) + "\r\n");
    }

    checkEventType = (type) => {
        return !(
            type === "DialBegin" ||
            type === "DialEnd" ||
            type === "Hangup" ||
            type === "Newstate");
    }

    checkContext = (contextName) => {
        return !(contextName === "mango-in")
    }
    
    isInbound = (number) => {
        return number.length >= 11;
    }

    isInternal = (fromNumber, toNumber) => {
        return fromNumber.length < 11 && toNumber.length < 11;
    }

    handle = (event) => {
        // this.writeLog(event);
        let eventType = event.Event;
        if (this.checkEventType(eventType)) return;

        if (eventType === "Newstate" && event.Linkedid === event.Uniqueid && event.ChannelStateDesc == "Ring"){
            let callType = (this.isInbound(event.CallerIDNum)) ? "inbound" : "outbound";
            let context = this.createContext(event, callType);
            this.contextCache[event.Linkedid] = context;
            this.writeLog(context);
        }

        if (eventType == "DialBegin" && this.contextCache[event.Linkedid] !== undefined) {
            // let destCallerIdNum = event.DestCallerIDNum
            // let callerIdNum = event.CallerIDNum;

            let context = this.contextCache[event.Linkedid];
            let lineNumber = (context.direction === "inbount") ? event.Exten : undefined;
            context.calls.push(event.DestUniqueid);
            
            let call = new CallDTO({
                "contextId": context.contextId,
                "callId": event.DestUniqueid,
                "fromNumber": event.CallerIDNum,
                "toNumber": event.DialString.replace(/.*\//, ""),
                "state": "appeared",
                "lineNumber": lineNumber,
                "direction": context.direction
            });

            this.callCache[event.DestUniqueid] = call;
            this.messageWsService.sendJsonMessage("1001", call);
            this.writeLog(call);
        }

        if (eventType == "DialEnd" && this.callCache[event.DestUniqueid] !== undefined) {
            let call = Object.assign({}, this.callCache[event.DestUniqueid]);

            if (event.DialStatus == "ANSWER"){
                call.answered_at = Date.now();
                call.state = "connected";
            } else {
                call.completed_at = Date.now();
                call.state = "disconnected";
            }

            this.callCache[event.DestUniqueid] = call;
            this.messageWsService.sendJsonMessage("1001", call);
            this.writeLog(call);
        }

        if (eventType == "Hangup" && this.callCache[event.Uniqueid] !== undefined) {
            let call = Object.assign({}, this.callCache[event.Uniqueid]);

            if (call.state !== "disconnected") {
                call.completed_at = Date.now();
                call.state = "disconnected";
                this.messageWsService.sendJsonMessage("1001", call);
                this.writeLog(call);
            }
            delete this.callCache[event.Uniqueid]
        }

        if (eventType == "Hangup" && this.contextCache[event.Uniqueid] !== undefined) {
            let context = Object.assign({}, this.contextCache[event.Uniqueid]);
            context.completed_at = Date.now();
            context.state = "end";
            context.duration = context.completed_at - context.created_at;
            setTimeout(() => {
                this.writeLog(context);
                delete this.contextCache[event.Uniqueid]
            }, 1000)
        }
    }

    createContext(event, type) {
        let lineNumber = (type === "inbound") ? event.Exten : undefined;
        return new ContextDTO({
            "contextId": event.Linkedid,
            "callId": event.Uniqueid,
            "fromNumber": event.CallerIDNum,
            "toNumber": event.Exten,
            "state": "create",
            "lineNumber": lineNumber,
            "direction": type
        });
    }
}

module.exports = EventHandler;