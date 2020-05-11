const CallDTO = require("../dto/CallDTO");
const SummaryDTO = require("../dto/SummaryDTO");
const CacheStoreFactory = require('../service/CacheStoreFactory');

class EventHandler {
    /**
     * 
     * @param {CacheStoreFactory} cacheStoreFactory 
     */
    constructor(cacheStoreFactory, messageWsService){
        this.cacheStoreFactory = cacheStoreFactory;
        this.messageWsService = messageWsService;
    }

    init(){
        this.cacheSummaryStore = this.cacheStoreFactory.get("SUMMARY");
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

    handle(event){
        let type = event.Event;
        let linkedId = event.Linkedid;
        let uniqueId = event.Uniqueid;
        let destUniqueId = event.DestUniqueid;
        let destCallerIdNum = event.DestCallerIDNum
        let callerIdNum = event.CallerIDNum;
        let exten = event.Exten;

        if (type == "Newstate" && event.ChannelStateDesc == "Ring") {
            console.log("Newstate");
            console.log(JSON.stringify(event, null, 2));
            let _isInbound = this.isInbound(callerIdNum);
            if (_isInbound){
                let call = new CallDTO({
                    "contextId": uniqueId,
                    "callId": uniqueId,
                    "fromNumber": callerIdNum,
                    "toNumber": exten,
                    "state": "appeared",
                    "lineNumber": exten,
                    "direction": "inbound",
                    "location": "ivr"
                });

                let summary = new SummaryDTO({
                    "contextId": uniqueId, 
                    "fromNumber": callerIdNum, 
                    "toNumber": exten, 
                    "direction": "inbound"
                });
                this.cacheSummaryStore.put(uniqueId, summary);
                // this.messageWsService.sendJsonMessage();
            }
        }

        if (type == "DialBegin") {
            console.log("DialBegin");
            console.log(JSON.stringify(event, null, 2));
            // let resultEvents = [];
            // let prevCallEvent = this.cacheCallStore.get(destUniqueId);
            if (callerIdNum == null) callerIdNum = destCallerIdNum;

            let _isInbound = this.isInbound(callerIdNum);
            let dialString = event.DialString.replace(/.*\//, "");
            let direction = _isInbound ? "inbound" : "outbound";
            let toNumber = (_isInbound || event.Exten == null) ? dialString : event.Exten;
            let lineNumber = _isInbound ? exten : null;
            let summary = this.cacheSummaryStore.get(linkedId);

            if (this.isInternal(callerIdNum, toNumber)) return;
            let call = new CallDTO({
                "contextId": linkedId,
                "callId": destUniqueId,
                "fromNumber": callerIdNum,
                "toNumber": toNumber,
                "state": "appeared",
                "lineNumber": lineNumber,
                "direction": direction,
                "location": "abonent"
            });
            summary.calls[destUniqueId] = call;
            this.messageWsService.sendJsonMessage("1001", call);
            this.cacheSummaryStore.put(linkedId, summary);
            // this.cacheCallStore.put(destUniqueId, call);
        }

        if (type == "DialEnd") {
            console.log(`DialEnd: ${destUniqueId}`);
            console.log(JSON.stringify(event, null, 2));
            let summary = this.cacheSummaryStore.get(linkedId);
            let prevCallEvent = summary.calls[destUniqueId];
            if (prevCallEvent == null || prevCallEvent.state == "disconnected") return;

            let state = (event.DialStatus == "ANSWER") ? "connected" : "disconnected";
            prevCallEvent.state = state;
            
            summary.calls[destUniqueId] = prevCallEvent;
            this.cacheSummaryStore.put(linkedId, summary);

            this.messageWsService.sendJsonMessage("1001", prevCallEvent);
        }

        if (type == "Hangup") {
            console.log(`Hangup: ${uniqueId}`);
            console.log(JSON.stringify(event, null, 2));
            let summary = this.cacheSummaryStore.get(linkedId);
            let prevCallEvent = summary.calls[uniqueId];

            if (linkedId == uniqueId){
                summary.end = Date.now();
                console.log(`Summary End: ${summary}`);
                
                this.cacheSummaryStore.put(uniqueId, summary);
                this.messageWsService.sendJsonMessage("1001", summary);
            }

            if (prevCallEvent == null || prevCallEvent.state == "disconnected") return;

            if (prevCallEvent.location == "abonent"){
                prevCallEvent.state = "disconnected";

                summary.calls[uniqueId] = prevCallEvent;
                this.cacheSummaryStore.put(uniqueId, summary);

                this.messageWsService.sendJsonMessage("1001", prevCallEvent);
            }
        }
    }
}

module.exports = EventHandler;