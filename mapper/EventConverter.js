const CallDTO = require("../dto/CallDTO");
const SummaryDTO = require("../dto/SummaryDTO");
const CacheStore = require('../service/CacheStore');

class EventConverter {
    /**
     * 
     * @param {CacheStore} cacheStore 
     */
    constructor(cacheStore){
        this.cacheStore = cacheStore;
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

    toCall(event){
        let type = event.Event;
        let linkedId = event.Linkedid;
        let uniqueId = event.Uniqueid;
        let destUniqueId = event.DestUniqueid;
        let destCallerIdNum = event.DestCallerIDNum
        let callerIdNum = event.CallerIDNum;
        let exten = event.Exten;

        if (type == "Newstate" && event.ChannelStateDesc == "Ring") {
            let _isInbound = this.isInbound(callerIdNum);
            if (_isInbound){
                let callEvent = new CallDTO({
                    "contextId": linkedId,
                    "callId": uniqueId,
                    "fromNumber": callerIdNum,
                    "toNumber": exten,
                    "state": "appeared",
                    "lineNumber": exten,
                    "direction": "inbound",
                    "location": "ivr"
                });
                this.cacheStore.put(uniqueId, callEvent);
                return callEvent
            }
        }

        if (type == "DialBegin") {
            let resultEvents = [];
            // let prevCallEvent = this.cacheStore.get(destUniqueId);
            if (callerIdNum == null) callerIdNum = destCallerIdNum;
            // if (prevCallEvent !== null && prevCallEvent.direction === "ivr"){
            //     resultEvents.push(prevCallEvent.state = "disconnected");
            // }

            let dialString = event.DialString.replace(/.*\//, "");
            let _isInbound = this.isInbound(callerIdNum);
            let direction = _isInbound ? "inbound" : "outbound";
            let toNumber = (_isInbound || event.Exten == null) ? dialString : event.Exten;
            let lineNumber = _isInbound ? exten : null;

            console.log(`DialBegin: ${destUniqueId} | ${callerIdNum} | ${toNumber} | ${direction}`);
            if (this.isInternal(callerIdNum, toNumber)) return;
            let callEvent = new CallDTO({
                "contextId": linkedId,
                "callId": destUniqueId,
                "fromNumber": callerIdNum,
                "toNumber": toNumber,
                "state": "appeared",
                "lineNumber": lineNumber,
                "direction": direction,
                "location": "abonent"
            });
            // resultEvents.push(callEvent);
            this.cacheStore.put(destUniqueId, callEvent);
            return callEvent
        }

        if (type == "DialEnd") {
            console.log(`DialEnd: ${destUniqueId}`);
            let prevCallEvent = this.cacheStore.get(destUniqueId);
            if (prevCallEvent == null) return;

            let prevState = prevCallEvent.state;
            if (prevState == "disconnected") return;

            let status = (event.DialStatus == "ANSWER") ? "connected" : "disconnected";
            let direction = prevCallEvent.direction;
            let fromNumber = prevCallEvent.fromNumber;
            let toNumber = prevCallEvent.toNumber;
            let lineNumber = prevCallEvent.lineNumber;
            let callEvent = new CallDTO({
                "contextId": linkedId,
                "callId": destUniqueId,
                "fromNumber": fromNumber,
                "toNumber": toNumber,
                "state": status,
                "lineNumber": lineNumber,
                "direction": direction,
                "location": "abonent"
            });
            this.cacheStore.put(destUniqueId, callEvent);
            return callEvent;
        }

        if (type == "Hangup") {
            console.log(`Hangup: ${uniqueId}`);
            let prevCallEvent = this.cacheStore.get(uniqueId);
            if (prevCallEvent == null || prevCallEvent.state == "disconnected") return;

            let direction = prevCallEvent.direction;
            let fromNumber = prevCallEvent.fromNumber;
            let toNumber = prevCallEvent.toNumber;
            let lineNumber = prevCallEvent.lineNumber;
            this.cacheStore.put(uniqueId, null);

            if (prevCallEvent.location == "ivr"){
                return new SummaryDTO({
                    "contextId": linkedId,
                    "fromNumber": fromNumber,
                    "toNumber": toNumber,
                    "direction": direction,
                });
            } else if (prevCallEvent.location == "abonent"){
                return new CallDTO({
                    "contextId": linkedId,
                    "callId": uniqueId,
                    "fromNumber": fromNumber,
                    "toNumber": toNumber,
                    "state": "disconnected",
                    "lineNumber": lineNumber,
                    "direction": direction,
                    "location": "abonent"
                });
            }
        }
    }
}

module.exports = EventConverter;