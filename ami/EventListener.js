const fs = require('fs');
// const EventHandler = require("./EventHandler");
const CallDTO = require("../dto/CallDTO");
const ContextDTO = require("../dto/ContextDTO");

class EventListener {
    cache = {}

    constructor(messageWsService) {
        this.messageWsService = messageWsService;
    }

    writeInFile(event){
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

    accept = (event) => {
        this.writeInFile(event);
        let eventType = event.Event;
        if (this.checkEventType(eventType)) return;

        if (eventType === "Newstate" && event.Linkedid === event.Uniqueid && event.ChannelStateDesc == "Ring"){
            // if (this.checkContext(event.Context)) return;

            if (this.isInbound(event.CallerIDNum)){ 
                let context = this.createInboundCall(event);
                this.cache[event.Linkedid] = context;
                this.writeInFile(context);
            } else {
                let context = this.createOutboundCall(event);
                this.cache[event.Linkedid] = context;
                this.writeInFile(context);
            }
        }

        if (eventType == "DialBegin") {
            if (this.cache[event.Linkedid] === undefined) return;
            let context = this.cache[event.Linkedid];
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

            this.cache[event.DestUniqueid] = call;
            this.messageWsService.sendJsonMessage("1001", call);
            this.writeInFile(call);
        }

        if (eventType == "DialEnd") {
            if (this.cache[event.DestUniqueid] === undefined) return;
            let call = Object.assign({}, this.cache[event.DestUniqueid]);
            
            let state = (event.DialStatus == "ANSWER") ? "connected" : "disconnected";
            call.timestamp = Date.now();
            call.state = state;
            this.messageWsService.sendJsonMessage("1001", call);
            this.writeInFile(call);
        }

        if (eventType == "Hangup") {
            if (this.cache[event.Uniqueid] === undefined) return;
            let call = Object.assign({}, this.cache[event.Uniqueid]);

            if (event.Linkedid === event.Uniqueid) {
                call.completed_at = Date.now();
                call.state = "end";
                call.duration = call.completed_at - call.created_at;
                setTimeout(() => {
                    this.writeInFile(call);
                }, 1000)
            } else {
                if (call.state !== "disconnected") {
                    call.timestamp = Date.now();
                    call.state = "disconnected";
                    this.messageWsService.sendJsonMessage("1001", call);
                    this.writeInFile(call);
                }
            }
            delete this.cache[event.Uniqueid]
        }





        // this.eventHandler.handle(event);
        // if (call == null) return;
        // let userExt = (call.direction == "inbound") ? call.toNumber : call.fromNumber;
        
        // console.log(`send message userExt: ${userExt} | ${call.fromNumber} | ${call.toNumber} | state: ${call.state} | ${call.contextId}`);
        // fs.appendFileSync("logs.txt", new Date().toString() + " " + JSON.stringify(call) + "\r\n");
        // this.messageWsService.sendJsonMessage(userExt, call);
    }

    createInboundCall(event) {
        return new ContextDTO({
            "contextId": event.Linkedid,
            "callId": event.Uniqueid,
            "fromNumber": event.CallerIDNum,
            "toNumber": event.Exten,
            "state": "create",
            "lineNumber": event.Exten,
            "direction": "inbound"
        });
    }

    createOutboundCall(event) {
        return new ContextDTO({
            "contextId": event.Linkedid,
            "callId": event.Uniqueid,
            "fromNumber": event.CallerIDNum,
            "toNumber": event.Exten,
            "state": "create",
            "direction": "outbound"
        });
    }
}

module.exports = EventListener;