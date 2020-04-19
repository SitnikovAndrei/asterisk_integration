class CallEventDTO {
  constructor({contextId, fromNumber, toNumber, state, lineNumber, callType, location}) {
    this.timestamp = Date.now();
    this.contextId = contextId;
    this.fromNumber = fromNumber;
    this.toNumber = toNumber;
    this.state = state;
    this.lineNumber = lineNumber;
    this.callType = callType;
    this.location = location;
  }
}


module.exports = CallEventDTO;