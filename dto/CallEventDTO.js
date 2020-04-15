class CallEventDTO {
  constructor({contextId, fromNumber, toNumber, state, lineNumber, callType}) {
    this.timestamp = Date.now();
    this.contextId = contextId;
    this.fromNumber = fromNumber;
    this.toNumber = toNumber;
    this.state = state;
    this.lineNumber = lineNumber;
    this.callType = callType;
  }
}


module.exports = CallEventDTO;